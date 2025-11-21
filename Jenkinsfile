pipeline {
    agent any

    environment {
    DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
    EC2_SSH_CREDENTIALS   = 'my-key'   // must match Terraform key_name

    // Docker Hub
    DOCKER_USER = "${DOCKERHUB_CREDENTIALS_USR}"
    DOCKER_PASS = "${DOCKERHUB_CREDENTIALS_PSW}"

    // AWS Credentials (MUST BE ADDED IN JENKINS)
    AWS_CREDS = credentials('aws-credentials')  // <-- you must create this

    AWS_ACCESS_KEY_ID     = "${AWS_CREDS_USR}"
    AWS_SECRET_ACCESS_KEY = "${AWS_CREDS_PSW}"
    AWS_REGION            = "ap-south-1"
}


    stages {

        /* -----------------------------
         * 1. Clone Repository
         * ----------------------------- */
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Bilaalofficial/greenjets.git'
            }
        }

        stage('DEBUG — Print Environment') {
    steps {
        sh "printenv | sort"
    }
}

        /* -----------------------------
         * 2. Terraform Init + Apply
         * ----------------------------- */
        stage('Terraform Init & Apply') {
            steps {
                script {
                    sh """
                        terraform -chdir=terraform init
                        terraform -chdir=terraform apply -auto-approve
                    """
                }
            }
        }

        /* -----------------------------
         * 3. Extract EC2 Public IP
         * ----------------------------- */
        stage('Get EC2 IP from Terraform') {
            steps {
                script {
                    EC2_HOST = sh(
                        script: """
                            terraform -chdir=terraform output -raw ec2_public_ip \
                            | sed 's/\\x1b\\[[0-9;]*m//g' | tr -d '\\e'
                        """,
                        returnStdout: true
                    ).trim()

                    if (!EC2_HOST || EC2_HOST == "") {
                        error "❌ Terraform did not return a valid EC2 public IP!"
                    }

                    echo "✔ EC2 Host: ${EC2_HOST}"
                }
            }
        }

        /* -----------------------------
         * 4. Build Backend Image
         * ----------------------------- */
        stage('Build Backend Docker Image') {
            steps {
                sh """
                docker build -t ${DOCKER_USER}/greenjets-backend:latest ./backend
                """
            }
        }

        /* -----------------------------
         * 5. Build Frontend Image
         * ----------------------------- */
        stage('Build Frontend Docker Image') {
            steps {
                sh """
                docker build -t ${DOCKER_USER}/greenjets-frontend:latest ./frontend
                """
            }
        }

        /* -----------------------------
         * 6. Push Images to Docker Hub
         * ----------------------------- */
        stage('Login & Push to Docker Hub') {
            steps {
                sh """
                echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin

                docker push ${DOCKER_USER}/greenjets-backend:latest
                docker push ${DOCKER_USER}/greenjets-frontend:latest
                """
            }
        }

        /* -----------------------------
         * 7. Deploy on EC2
         * ----------------------------- */
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

    /* -----------------------------
     * 8. Cleanup (Always Runs)
     * ----------------------------- */
    post {
        always {
            echo "🧹 Cleaning Docker cache..."
            sh 'docker system prune -af || true'
        }
    }
}
