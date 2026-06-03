package storage

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/codes"
)

// AvatarStorage S3にアバター画像を保存するクライアント (署名付きURL方式)
type AvatarStorage struct {
	presignClient *s3.PresignClient
	bucket        string
	baseURL       string
}

// NewAvatarStorage AvatarStorageのファクトリ関数
func NewAvatarStorage(s3Client *s3.Client, bucket string, baseURL string) *AvatarStorage {
	return &AvatarStorage{
		presignClient: s3.NewPresignClient(s3Client),
		bucket:        bucket,
		baseURL:       baseURL,
	}
}

// extByContentType サポートする画像形式 → 拡張子のマッピング
var extByContentType = map[string]string{
	"image/jpeg": "jpg",
	"image/png":  "png",
	"image/webp": "webp",
}

// GeneratePresignedUploadURL アバター画像アップロード用の署名付きURLを生成する (5分有効)
func (a *AvatarStorage) GeneratePresignedUploadURL(ctx context.Context, contentType string, contentLength int64) (uploadURL string, publicURL string, err error) {
	ctx, span := tracer.Start(ctx, "storage.Avatar.GeneratePresignedUploadURL")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	ext, ok := extByContentType[contentType]
	if !ok {
		return "", "", fmt.Errorf("サポートしていないコンテンツタイプです: %s", contentType)
	}

	key := fmt.Sprintf("avatars/%s.%s", uuid.NewString(), ext)

	presigned, err := a.presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(a.bucket),
		Key:           aws.String(key),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(contentLength),
	}, s3.WithPresignExpires(5*time.Minute))
	if err != nil {
		return "", "", fmt.Errorf("署名付きURLの生成に失敗しました: %w", err)
	}

	return presigned.URL, fmt.Sprintf("%s/%s", a.baseURL, key), nil
}
