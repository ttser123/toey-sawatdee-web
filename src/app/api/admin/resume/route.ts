import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-1',
});

const cfClient = new CloudFrontClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
});

const BUCKET_NAME = 'toey-sawatdee-assets-prod';
const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // 1. Upload to S3
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: 'resume.pdf',
            Body: buffer,
            ContentType: 'application/pdf',
        }));

        // 2. Invalidate CloudFront Cache if distribution ID is available
        if (DISTRIBUTION_ID) {
            await cfClient.send(new CreateInvalidationCommand({
                DistributionId: DISTRIBUTION_ID,
                InvalidationBatch: {
                    CallerReference: `resume-upload-${Date.now()}`,
                    Paths: {
                        Quantity: 1,
                        Items: ['/assets/resume.pdf'],
                    },
                },
            }));
        }

        return NextResponse.json({ success: true, message: 'Resume uploaded and cache invalidated' });
    } catch (error: any) {
        console.error('Resume upload error:', error);
        return NextResponse.json({ error: error.message || 'Failed to upload resume' }, { status: 500 });
    }
}
