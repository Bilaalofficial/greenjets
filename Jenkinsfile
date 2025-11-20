pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        EC2_SSH_CREDENTIALS   = 'ec2-ssh-key'
        DOCKER_USER           = "${DOCKERHUB_CREDENTIALS_USR}"
        DOCKER_PASS           = "${DOCKERHUB_CREDENTIALS_PSW}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Bilaalofficial/greenjets.git'
            }
        }

        stage('Get EC2 IP from Terraform') {
            steps {
                script {
                    EC2_HOST = sh(
                        script: "terraform -chdir=terraform output -raw ec2_public_ip",
                        returnStdout: true
                    ).trim()

                    echo "EC2 Host found: ${EC2_HOST}"
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh """
                docker build -t ${DOCKER_USER}/greenjets-backend:latest ./backend
                """
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh """
                docker build -t ${DOCKER_USER}/greenjets-frontend:latest ./frontend
                """
            }
        }

        stage('Login & Push to Docker Hub') {
            steps {
                sh """
                echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin
                docker push ${DOCKER_USER}/greenjets-backend:latest
                docker push ${DOCKER_USER}/greenjets-frontend:latest
                """
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent([EC2_SSH_CREDENTIALS]) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                        cd /home/ubuntu/greenjets &&
                        sudo docker compose pull &&
                        sudo docker compose down &&
                        sudo docker compose up -d
                    '
                    """
                }
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning Docker cache..."
            sh 'docker system prune -af || true'
        }
    }
}
