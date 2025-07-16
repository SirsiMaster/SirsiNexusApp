// Generated proto code will be included here
pub mod sirsi {
    pub mod agent {
        pub mod v1 {
            tonic::include_proto!("sirsi.agent.v1");
            
            // File descriptor set for gRPC reflection
            pub const FILE_DESCRIPTOR_SET: &[u8] = tonic::include_file_descriptor_set!("sirsi_descriptor");
        }
    }
    
    pub mod v1 {
        tonic::include_proto!("sirsi.v1");
    }
}

// Re-export for easier access
pub use sirsi::agent::v1::*;
