import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// ── VERIFIER CONFIGURATION ──────────────────────────────────────────

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  tokenUse: "access",
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
});

// ── AWS CLIENTS ──────────────────────────────────────────────────────

const s3Client = new S3Client({ region: 'ap-southeast-2' });
const cfClient = new CloudFrontClient({ region: 'ap-southeast-2' });

// ── API ROUTE ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing Token' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      await verifier.verify(token);
    } catch (err) {
      console.error('[API] JWT Verification Failed:', err);
      return NextResponse.json({ error: 'Unauthorized: Invalid Token' }, { status: 401 });
    }

    // 2. Extract File from Multipart Form
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file type. Only PDF allowed.' }, { status: 400 });
    }

    // 3. Upload to S3
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'toey-sawatdee-assets-prod';
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: 'assets/resume.pdf',
      Body: buffer,
      ContentType: 'application/pdf',
    }));

    // 4. Invalidate CloudFront Cache
    const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2EJ99FEDPCSYA';
    
    await cfClient.send(new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `resume-upload-${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: ['/assets/resume.pdf'],
        },
      },
    }));

    return NextResponse.json({ 
      success: true, 
      message: 'Resume uploaded and CDN cache invalidated successfully.' 
    });

  } catch (error: unknown) {
    console.error('[API] Resume Upload Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: errorMessage 
    }, { status: 500 });
  }
}
