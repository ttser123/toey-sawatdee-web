import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import fs from 'fs';
import path from 'path';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-2',
});

const cfClient = new CloudFrontClient({
    region: process.env.AWS_REGION || 'ap-southeast-2',
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
            Key: 'assets/resume.pdf',
            Body: buffer,
            ContentType: 'application/pdf',
        }));

        // 1b. Write to local filesystem as a fallback/sync measure
        try {
            const localPath = path.join(process.cwd(), 'public', 'assets', 'resume.pdf');
            // Ensure public/assets directory exists
            const dirPath = path.dirname(localPath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            fs.writeFileSync(localPath, buffer);
            console.log('=> [Sync] Resume successfully written to local public assets');
        } catch (localWriteError) {
            console.warn('=> [Sync Warning] Failed to sync uploaded resume to local filesystem:', localWriteError);
        }

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
