# ==============================================================================
# QGC Backend Deployment Script for Google Cloud Run
# ==============================================================================

$PROJECT_ID="qgc-100"
$REGION="asia-south1"
$SERVICE_NAME="qgc-backend"

# Ensure the project is set
Write-Host "Setting project to $PROJECT_ID..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

# Deploy to Cloud Run
# 1. Builds the image using Cloud Build (based on Dockerfile)
# 2. Deploys the service to Cloud Run
Write-Host "Deploying $SERVICE_NAME to Google Cloud Run..." -ForegroundColor Cyan

gcloud run deploy $SERVICE_NAME `
  --source . `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars "MONGO_URI=mongodb+srv://QGC:QGC123@qgc.11dm4bi.mongodb.net/qgc_db?appName=QGC,EMAIL_USER=aviatricksaerolab@gmail.com,EMAIL_PASS=yxdi hbic fmip rcku"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccessfully deployed QGC Backend!" -ForegroundColor Green
    Write-Host "Service is live!" -ForegroundColor Green
} else {
    Write-Host "`nDeployment failed." -ForegroundColor Red
}
