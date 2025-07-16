//! # Communication Module
//!
//! This module provides the communication infrastructure for agent coordination,
//! including event bus, message routing, and inter-agent communication.

pub mod event_bus;
pub mod message_schemas;

pub use event_bus::{EventBus, AgentEvent, AgentEventType, EventSubscription};
pub use message_schemas::*;
