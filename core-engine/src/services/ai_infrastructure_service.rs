use serde::{Deserialize, Serialize};
use anyhow::Result;
use tracing::{info, warn};
use async_openai::{Client as OpenAIClient, types::{CreateChatCompletionRequestArgs, ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestUserMessageArgs}};
use reqwest::Client as HttpClient;
use serde_json::json;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InfrastructureRequest {
    pub description: String,
    pub cloud_provider: CloudProvider,
    pub ai_provider: AIProvider,
    pub requirements: InfrastructureRequirements,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CloudProvider {
    AWS,
    Azure,
    GCP,
    Kubernetes,
    IBM,
    Oracle,
    Alibaba,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AIProvider {
    OpenAI,
    Claude3_5Sonnet,
    ClaudeCode,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InfrastructureRequirements {
    pub budget_limit: Option<f64>,
    pub performance_tier: PerformanceTier,
    pub security_level: SecurityLevel,
    pub compliance_requirements: Vec<String>,
    pub scaling_requirements: Option<ScalingRequirements>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PerformanceTier {
    Basic,
    Standard,
    Premium,
    Enterprise,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SecurityLevel {
    Basic,
    Enhanced,
    Maximum,
    Compliant,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScalingRequirements {
    pub min_instances: u32,
    pub max_instances: u32,
    pub auto_scaling: bool,
    pub load_balancing: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InfrastructureResponse {
    pub template: String,
    pub template_type: String,
    pub estimated_cost: Option<f64>,
    pub security_recommendations: Vec<String>,
    pub optimization_suggestions: Vec<String>,
    pub deployment_instructions: Vec<String>,
    pub ai_provider_used: AIProvider,
    pub confidence_score: f64,
}

pub struct AIInfrastructureService {
    openai_client: Option<OpenAIClient<async_openai::config::OpenAIConfig>>,
    http_client: HttpClient,
    anthropic_api_key: Option<String>,
    mock_mode: bool,
}


impl AIInfrastructureService {
    pub fn new() -> Self {
        let openai_client = if let Ok(_api_key) = std::env::var("OPENAI_API_KEY") {
            info!("OpenAI API key found, enabling real AI integration");
            Some(OpenAIClient::new())
        } else {
            warn!("OpenAI API key not found, AI service will use mock mode");
            None
        };

        let anthropic_api_key = if let Ok(api_key) = std::env::var("ANTHROPIC_API_KEY") {
            info!("Anthropic API key found, enabling Claude integration");
            Some(api_key)
        } else {
            warn!("Anthropic API key not found, Claude service will use mock mode");
            None
        };

        let mock_mode = openai_client.is_none() && anthropic_api_key.is_none();

        Self {
            openai_client,
            http_client: HttpClient::new(),
            anthropic_api_key,
            mock_mode,
        }
    }

    pub fn is_mock_mode(&self) -> bool {
        self.mock_mode
    }

    pub async fn generate_infrastructure(&self, request: InfrastructureRequest) -> Result<InfrastructureResponse> {
        info!("Generating infrastructure for {:?} using {:?}", request.cloud_provider, request.ai_provider);

        if self.mock_mode {
            return self.generate_mock_infrastructure(request).await;
        }

        match request.ai_provider {
            AIProvider::OpenAI => self.generate_with_openai(request).await,
            AIProvider::Claude3_5Sonnet | AIProvider::ClaudeCode => self.generate_with_claude(request).await,
        }
    }

    async fn generate_with_openai(&self, request: InfrastructureRequest) -> Result<InfrastructureResponse> {
        if let Some(ref client) = self.openai_client {
            let prompt = self.build_prompt(&request);
            
            let system_message = ChatCompletionRequestSystemMessageArgs::default()
                .content("You are an expert infrastructure architect. Generate production-ready infrastructure templates with best practices, security, and cost optimization.")
                .build()?;
            
            let user_message = ChatCompletionRequestUserMessageArgs::default()
                .content(prompt.clone())
                .build()?;
            
            let chat_request = CreateChatCompletionRequestArgs::default()
                .model("gpt-3.5-turbo")
                .messages(vec![system_message.into(), user_message.into()])
                .max_tokens(3000_u16)
                .temperature(0.3)
                .build()?;

            let response = client.chat().create(chat_request).await?;
            
            if let Some(choice) = response.choices.first() {
                if let Some(ref message) = choice.message.content {
                    let template = message.clone();
                    
                    return Ok(InfrastructureResponse {
                        template,
                        template_type: self.get_template_type(&request.cloud_provider),
                        estimated_cost: self.estimate_cost(&request),
                        security_recommendations: self.generate_security_recommendations(&request),
                        optimization_suggestions: self.generate_optimization_suggestions(&request),
                        deployment_instructions: self.generate_deployment_instructions(&request),
                        ai_provider_used: request.ai_provider,
                        confidence_score: 0.92, // Higher confidence with GPT-4
                    });
                }
            }
        }

        // Fallback to mock if OpenAI fails
        self.generate_mock_infrastructure(request).await
    }

    async fn generate_with_claude(&self, request: InfrastructureRequest) -> Result<InfrastructureResponse> {
        if let Some(ref api_key) = self.anthropic_api_key {
            let prompt = self.build_prompt(&request);
            
            let system_prompt = "You are an expert infrastructure architect specializing in cloud infrastructure as code. Generate production-ready, secure, and cost-optimized infrastructure templates with comprehensive documentation and best practices.";
            
            let request_body = json!({
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 3000,
                "temperature": 0.3,
                "messages": [{
                    "role": "user",
                    "content": format!("{} {}", system_prompt, prompt)
                }]
            });
            
            let response = self.http_client
                .post("https://api.anthropic.com/v1/messages")
                .header("Content-Type", "application/json")
                .header("x-api-key", api_key)
                .header("anthropic-version", "2023-06-01")
                .json(&request_body)
                .send()
                .await?;
            
            if response.status().is_success() {
                let response_json: serde_json::Value = response.json().await?;
                
                let mut template = String::new();
                if let Some(content_array) = response_json["content"].as_array() {
                    for content in content_array {
                        if let Some(text) = content["text"].as_str() {
                            template.push_str(text);
                        }
                    }
                }
                
                return Ok(InfrastructureResponse {
                    template,
                    template_type: self.get_template_type(&request.cloud_provider),
                    estimated_cost: self.estimate_cost(&request),
                    security_recommendations: self.generate_security_recommendations(&request),
                    optimization_suggestions: self.generate_optimization_suggestions(&request),
                    deployment_instructions: self.generate_deployment_instructions(&request),
                    ai_provider_used: request.ai_provider,
                    confidence_score: 0.94, // Higher confidence with Claude-3.5-Sonnet
                });
            } else {
                warn!("Claude API request failed with status: {}", response.status());
            }
        }

        // Fallback to mock if Claude fails
        self.generate_mock_infrastructure(request).await
    }

    async fn generate_mock_infrastructure(&self, request: InfrastructureRequest) -> Result<InfrastructureResponse> {
        warn!("Using mock AI infrastructure generation");

        let template = match request.cloud_provider {
            CloudProvider::AWS => self.generate_aws_template(&request),
            CloudProvider::Azure => self.generate_azure_template(&request),
            CloudProvider::GCP => self.generate_gcp_template(&request),
            CloudProvider::Kubernetes => self.generate_k8s_template(&request),
            CloudProvider::IBM => self.generate_ibm_template(&request),
            CloudProvider::Oracle => self.generate_oracle_template(&request),
            CloudProvider::Alibaba => self.generate_alibaba_template(&request),
        };

        Ok(InfrastructureResponse {
            template,
            template_type: self.get_template_type(&request.cloud_provider),
            estimated_cost: self.estimate_cost(&request),
            security_recommendations: self.generate_security_recommendations(&request),
            optimization_suggestions: self.generate_optimization_suggestions(&request),
            deployment_instructions: self.generate_deployment_instructions(&request),
            ai_provider_used: request.ai_provider,
            confidence_score: 0.75, // Lower confidence for mock mode
        })
    }

    fn build_prompt(&self, request: &InfrastructureRequest) -> String {
        let provider_name = match request.cloud_provider {
            CloudProvider::AWS => "AWS",
            CloudProvider::Azure => "Azure",
            CloudProvider::GCP => "Google Cloud Platform",
            CloudProvider::Kubernetes => "Kubernetes",
            CloudProvider::IBM => "IBM Cloud",
            CloudProvider::Oracle => "Oracle Cloud",
            CloudProvider::Alibaba => "Alibaba Cloud",
        };

        let template_type = self.get_template_type(&request.cloud_provider);

        format!(
            r#"Generate a complete {template_type} infrastructure template for {provider_name} based on the following requirements:

Description: {description}
Performance Tier: {performance_tier:?}
Security Level: {security_level:?}
Budget Limit: {budget}

Requirements:
- Create secure, scalable infrastructure
- Follow best practices for {provider_name}
- Include proper tagging and naming conventions
- Implement appropriate security groups/network policies
- Consider cost optimization

Please provide:
1. Complete infrastructure template
2. Security recommendations
3. Optimization suggestions
4. Deployment instructions

Template format: {template_type}"#,
            template_type = template_type,
            provider_name = provider_name,
            description = request.description,
            performance_tier = request.requirements.performance_tier,
            security_level = request.requirements.security_level,
            budget = request.requirements.budget_limit.map(|b| format!("${:.2}", b)).unwrap_or_else(|| "No limit".to_string()),
        )
    }

    fn get_template_type(&self, provider: &CloudProvider) -> String {
        match provider {
            CloudProvider::AWS | CloudProvider::GCP | CloudProvider::IBM | CloudProvider::Oracle | CloudProvider::Alibaba => "Terraform",
            CloudProvider::Azure => "Bicep", 
            CloudProvider::Kubernetes => "YAML",
        }.to_string()
    }

    fn generate_aws_template(&self, request: &InfrastructureRequest) -> String {
        format!(r#"# AWS Infrastructure Template - Generated by SirsiNexus
# Description: {}

terraform {{
  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }}
  }}
}}

provider "aws" {{
  region = "us-west-2"
}}

# VPC
resource "aws_vpc" "main" {{
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {{
    Name        = "sirsi-generated-vpc"
    Environment = "{}"
    ManagedBy   = "SirsiNexus"
  }}
}}

# Internet Gateway
resource "aws_internet_gateway" "main" {{
  vpc_id = aws_vpc.main.id

  tags = {{
    Name      = "sirsi-generated-igw"
    ManagedBy = "SirsiNexus"
  }}
}}

# Public Subnet
resource "aws_subnet" "public" {{
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-west-2a"
  map_public_ip_on_launch = true

  tags = {{
    Name      = "sirsi-generated-public-subnet"
    Type      = "Public"
    ManagedBy = "SirsiNexus"
  }}
}}

# Security Group
resource "aws_security_group" "main" {{
  name_prefix = "sirsi-generated"
  vpc_id      = aws_vpc.main.id

  ingress {{
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  ingress {{
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  tags = {{
    Name      = "sirsi-generated-sg"
    ManagedBy = "SirsiNexus"
  }}
}}

# EC2 Instance
resource "aws_instance" "main" {{
  ami             = "ami-0c02fb55956c7d316" # Amazon Linux 2
  instance_type   = "{}"
  subnet_id       = aws_subnet.public.id
  security_groups = [aws_security_group.main.id]

  tags = {{
    Name      = "sirsi-generated-instance"
    ManagedBy = "SirsiNexus"
  }}
}}

# Output
output "instance_public_ip" {{
  value = aws_instance.main.public_ip
}}

output "vpc_id" {{
  value = aws_vpc.main.id
}}"#, 
            request.description,
            match request.requirements.performance_tier {
                PerformanceTier::Basic => "development",
                PerformanceTier::Standard => "staging", 
                PerformanceTier::Premium => "production",
                PerformanceTier::Enterprise => "enterprise",
            },
            match request.requirements.performance_tier {
                PerformanceTier::Basic => "t3.micro",
                PerformanceTier::Standard => "t3.small",
                PerformanceTier::Premium => "t3.medium", 
                PerformanceTier::Enterprise => "t3.large",
            }
        )
    }

    // Implementation for other cloud providers would be similar...
    fn generate_azure_template(&self, _request: &InfrastructureRequest) -> String {
        "// Azure Bicep template - Implementation pending".to_string()
    }

    fn generate_gcp_template(&self, _request: &InfrastructureRequest) -> String {
        "# GCP Terraform template - Implementation pending".to_string()
    }

    fn generate_k8s_template(&self, _request: &InfrastructureRequest) -> String {
        "# Kubernetes YAML template - Implementation pending".to_string()
    }

    fn generate_ibm_template(&self, _request: &InfrastructureRequest) -> String {
        "# IBM Cloud Terraform template - Implementation pending".to_string()
    }

    fn generate_oracle_template(&self, _request: &InfrastructureRequest) -> String {
        "# Oracle Cloud Terraform template - Implementation pending".to_string()
    }

    fn generate_alibaba_template(&self, _request: &InfrastructureRequest) -> String {
        "# Alibaba Cloud Terraform template - Implementation pending".to_string()
    }

    fn estimate_cost(&self, request: &InfrastructureRequest) -> Option<f64> {
        // Simple cost estimation based on performance tier
        let base_cost = match request.requirements.performance_tier {
            PerformanceTier::Basic => 50.0,
            PerformanceTier::Standard => 150.0,
            PerformanceTier::Premium => 350.0,
            PerformanceTier::Enterprise => 750.0,
        };

        Some(base_cost)
    }

    fn generate_security_recommendations(&self, request: &InfrastructureRequest) -> Vec<String> {
        let mut recommendations = Vec::new();

        match request.requirements.security_level {
            SecurityLevel::Basic => {
                recommendations.push("Enable basic firewall rules".to_string());
                recommendations.push("Use HTTPS for web traffic".to_string());
            }
            SecurityLevel::Enhanced => {
                recommendations.push("Enable WAF (Web Application Firewall)".to_string());
                recommendations.push("Implement network segmentation".to_string());
                recommendations.push("Enable encryption at rest".to_string());
            }
            SecurityLevel::Maximum => {
                recommendations.push("Enable all advanced security features".to_string());
                recommendations.push("Implement zero-trust network architecture".to_string());
                recommendations.push("Enable comprehensive logging and monitoring".to_string());
                recommendations.push("Use dedicated security groups per service".to_string());
            }
            SecurityLevel::Compliant => {
                recommendations.push("Ensure compliance with industry standards".to_string());
                recommendations.push("Enable audit logging".to_string());
                recommendations.push("Implement data classification".to_string());
            }
        }

        recommendations
    }

    fn generate_optimization_suggestions(&self, _request: &InfrastructureRequest) -> Vec<String> {
        vec![
            "Consider using auto-scaling for variable workloads".to_string(),
            "Implement CloudWatch/monitoring for cost optimization".to_string(),
            "Use reserved instances for predictable workloads".to_string(),
            "Enable resource tagging for cost allocation".to_string(),
        ]
    }

    fn generate_deployment_instructions(&self, request: &InfrastructureRequest) -> Vec<String> {
        let template_type = self.get_template_type(&request.cloud_provider);
        
        match template_type.as_str() {
            "Terraform" => vec![
                "1. Save the template as main.tf".to_string(),
                "2. Run 'terraform init' to initialize".to_string(),
                "3. Run 'terraform plan' to preview changes".to_string(),
                "4. Run 'terraform apply' to deploy".to_string(),
                "5. Run 'terraform destroy' to clean up".to_string(),
            ],
            "Bicep" => vec![
                "1. Save the template as main.bicep".to_string(),
                "2. Run 'az deployment group create' to deploy".to_string(),
            ],
            "YAML" => vec![
                "1. Save the template as infrastructure.yaml".to_string(),
                "2. Run 'kubectl apply -f infrastructure.yaml'".to_string(),
            ],
            _ => vec!["Follow cloud provider specific deployment instructions".to_string()],
        }
    }
}

impl Default for AIInfrastructureService {
    fn default() -> Self {
        Self::new()
    }
}
