pipeline {
    agent any

    parameters {
        string(name: 'EC2_HOST', defaultValue: '13.233.123.45', description: 'Enter the target EC2 server IP address')
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        EC2_SSH_CREDENTIALS = 'ec2-ssh-key'
        DOCKER_USER = "${DOCKERHUB_CREDENTIALS_USR}"
        DOCKER_PASS = "${DOCKERHUB_CREDENTIALS_PSW}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Bilaalofficial/greenjets.git'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh """
                docker build -t $DOCKER_USER/greenjets-backend:latest ./backend
                """
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh """
                docker build -t $DOCKER_USER/greenjets-frontend:latest ./frontend
                """
            }
        }

        stage('Login & Push to Docker Hub') {
            steps {
                sh """
                echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                docker push $DOCKER_USER/greenjets-backend:latest
                docker push $DOCKER_USER/greenjets-frontend:latest
                """
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo "Deploying to EC2 at ${params.EC2_HOST}"
                sshagent([EC2_SSH_CREDENTIALS]) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ubuntu@${params.EC2_HOST} '
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
            echo "🧹 Cleaning up Docker cache..."
            sh 'docker system prune -af || true'
        }
    }
}
