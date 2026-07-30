pipeline {
    agent any

    environment {
        // Change these to your Docker Hub username / image names
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKER_USER             = 'yosri369'
        BACKEND_IMAGE           = "${DOCKER_USER}/parapharmacy-backend"
        FRONTEND_IMAGE          = "${DOCKER_USER}/parapharmacy-frontend"
        TAG                     = "${BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo '📥 Pulling latest code from GitHub...'
                checkout scm
            }
        }

        stage('2. Build Backend & Frontend Docker Images') {
            steps {
                echo '🔨 Building Docker Images...'
                script {
                    // Build Backend Image
                    sh "docker build -t ${BACKEND_IMAGE}:${TAG} -t ${BACKEND_IMAGE}:latest ."
                    
                    // Build Frontend Image
                    dir('parapharmacy-frontend') {
                        sh "docker build -t ${FRONTEND_IMAGE}:${TAG} -t ${FRONTEND_IMAGE}:latest ."
                    }
                }
            }
        }

        stage('3. Push Images to Docker Hub') {
            steps {
                echo '🐳 Pushing Images to Docker Hub...'
                script {
                    withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'DOCKER_HUB_USER', passwordVariable: 'DOCKER_HUB_PASS')]) {
                        sh "echo $DOCKER_HUB_PASS | docker login -u $DOCKER_HUB_USER --password-stdin"
                        
                        // Push Backend
                        sh "docker push ${BACKEND_IMAGE}:${TAG}"
                        sh "docker push ${BACKEND_IMAGE}:latest"
                        
                        // Push Frontend
                        sh "docker push ${FRONTEND_IMAGE}:${TAG}"
                        sh "docker push ${FRONTEND_IMAGE}:latest"
                    }
                }
            }
        }

        stage('4. Deploy to Production') {
            steps {
                echo '🚀 Deploying new version to production server...'
                script {
                    // Pulls latest images and restarts containers on your production server
                    sh "docker compose pull"
                    sh "docker compose up -d"
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment Pipeline Successful!'
        }
        failure {
            echo '❌ Pipeline Failed. Check Jenkins logs for details.'
        }
    }
}
