# CLI

The CLI component provides a comprehensive command-line interface for interacting with ClusterDB, including command management, shell completion, and interactive mode.

## Overview

The CLI component provides:
- Command management
- Shell completion
- Interactive mode
- Plugin support
- Configuration management
- Output formatting
- Command aliases

## Features

### Command Structure

```rust
// Define CLI structure
let cli = Cli {
    name: "clusterdb",
    version: "1.0.0",
    description: "ClusterDB command line interface",
    author: "ClusterDB Team",
    commands: vec![
        Command {
            name: "cluster",
            description: "Manage clusters",
            subcommands: vec![
                Command {
                    name: "create",
                    description: "Create a new cluster",
                    args: vec![
                        Argument {
                            name: "name",
                            description: "Cluster name",
                            required: true,
                            validator: Some(Box::new(|name: &str| {
                                if name.chars().all(|c| c.is_alphanumeric() || c == '-') {
                                    Ok(())
                                } else {
                                    Err("Cluster name must be alphanumeric")
                                }
                            })),
                        },
                        Argument {
                            name: "size",
                            description: "Cluster size",
                            required: false,
                            default: Some("3"),
                            validator: Some(Box::new(|size: &str| {
                                size.parse::<u32>().map(|_| ()).map_err(|_| "Size must be a number")
                            })),
                        },
                    ],
                    flags: vec![
                        Flag {
                            name: "wait",
                            short: Some('w'),
                            description: "Wait for cluster to be ready",
                            value_type: FlagType::Bool,
                            default: Some("false"),
                        },
                    ],
                    handler: Box::new(|ctx| async move {
                        let name = ctx.arg("name")?;
                        let size = ctx.arg("size")?.parse::<u32>()?;
                        let wait = ctx.flag("wait")?.parse::<bool>()?;
                        
                        let cluster = create_cluster(name, size, wait).await?;
                        ctx.output.success("Cluster created successfully", cluster)
                    }),
                },
                Command {
                    name: "list",
                    description: "List clusters",
                    flags: vec![
                        Flag {
                            name: "output",
                            short: Some('o'),
                            description: "Output format (table, json, yaml)",
                            value_type: FlagType::String,
                            default: Some("table"),
                            validator: Some(Box::new(|fmt: &str| {
                                match fmt {
                                    "table" | "json" | "yaml" => Ok(()),
                                    _ => Err("Invalid output format"),
                                }
                            })),
                        },
                    ],
                    handler: Box::new(|ctx| async move {
                        let format = ctx.flag("output")?;
                        let clusters = list_clusters().await?;
                        ctx.output.format(format, clusters)
                    }),
                },
            ],
        },
        Command {
            name: "config",
            description: "Manage configuration",
            subcommands: vec![
                Command {
                    name: "set",
                    description: "Set configuration value",
                    args: vec![
                        Argument {
                            name: "key",
                            description: "Configuration key",
                            required: true,
                        },
                        Argument {
                            name: "value",
                            description: "Configuration value",
                            required: true,
                        },
                    ],
                    handler: Box::new(|ctx| async move {
                        let key = ctx.arg("key")?;
                        let value = ctx.arg("value")?;
                        set_config(key, value).await?;
                        ctx.output.success("Configuration updated", ())
                    }),
                },
            ],
        },
    ],
    global_flags: vec![
        Flag {
            name: "verbose",
            short: Some('v'),
            description: "Enable verbose output",
            value_type: FlagType::Bool,
            default: Some("false"),
        },
        Flag {
            name: "config",
            short: Some('c'),
            description: "Config file path",
            value_type: FlagType::String,
            default: Some("~/.clusterdb/config.yaml"),
        },
    ],
};

// Run CLI
cli.run().await?;
```

### Interactive Mode

```rust
// Configure interactive mode
let interactive = Interactive {
    prompt: "clusterdb> ",
    history_file: "~/.clusterdb/history",
    completion: Completion {
        enabled: true,
        case_sensitive: false,
        min_word_len: 2,
    },
    keybindings: vec![
        Keybinding {
            key: "ctrl-r",
            description: "Search history",
            action: Action::SearchHistory,
        },
        Keybinding {
            key: "ctrl-l",
            description: "Clear screen",
            action: Action::ClearScreen,
        },
    ],
    syntax_highlighting: true,
    auto_suggestions: true,
};

cli.set_interactive(interactive);

// Start interactive mode
cli.start_interactive().await?;
```

### Shell Completion

```rust
// Generate shell completions
let completion = Completion {
    shell: Shell::Bash,
    output: "~/.bash_completion.d/clusterdb",
};

cli.generate_completion(completion)?;

// Configure dynamic completion
let completions = Completions {
    commands: vec![
        CommandCompletion {
            name: "cluster",
            subcommands: vec![
                "create",
                "list",
                "delete",
            ],
        },
    ],
    arguments: vec![
        ArgumentCompletion {
            command: "cluster create",
            arg: "name",
            suggestions: Box::new(|ctx| async move {
                let clusters = list_clusters().await?;
                Ok(clusters.iter().map(|c| c.name.clone()).collect())
            }),
        },
    ],
};

cli.set_completions(completions);
```

### Plugin Support

```rust
// Configure plugin system
let plugins = Plugins {
    directory: "~/.clusterdb/plugins",
    auto_load: true,
    allowed_sources: vec![
        "https://plugins.clusterdb.io",
    ],
    hooks: vec![
        PluginHook {
            name: "pre_command",
            handler: Box::new(|ctx| async move {
                // Plugin pre-command logic
                Ok(())
            }),
        },
        PluginHook {
            name: "post_command",
            handler: Box::new(|ctx| async move {
                // Plugin post-command logic
                Ok(())
            }),
        },
    ],
};

cli.configure_plugins(plugins).await?;

// Register plugin
let plugin = Plugin {
    name: "custom-commands",
    version: "1.0.0",
    commands: vec![
        Command {
            name: "custom",
            description: "Custom command",
            handler: Box::new(|ctx| async move {
                // Custom command logic
                Ok(())
            }),
        },
    ],
};

cli.register_plugin(plugin).await?;
```

## Architecture

```plaintext
+------------------+
|       CLI        |
+------------------+
         |
+------------------+     +------------------+     +------------------+
| Command Manager  |     | Shell Manager    |     | Plugin Manager  |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Config Manager   |     | Input Manager    |     | Output Manager  |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Command Registry |     | Completion Engine|     | Format Engine   |
+------------------+     +------------------+     +------------------+
```

### Components

1. **Command Manager**
   - Command registration
   - Command execution
   - Argument parsing
   - Flag handling

2. **Shell Manager**
   - Interactive mode
   - History management
   - Completion
   - Keybindings

3. **Plugin Manager**
   - Plugin loading
   - Plugin execution
   - Hook management
   - Plugin updates

4. **Output Manager**
   - Output formatting
   - Color support
   - Progress display
   - Error handling

## Configuration

### CLI Configuration

```yaml
cli:
  name: clusterdb
  version: 1.0.0
  
  interactive:
    prompt: "clusterdb> "
    history_file: ~/.clusterdb/history
    completion: true
    syntax_highlighting: true
  
  plugins:
    directory: ~/.clusterdb/plugins
    auto_load: true
```

### Command Configuration

```yaml
commands:
  cluster:
    subcommands:
      create:
        args:
          - name: name
            required: true
          - name: size
            default: "3"
        flags:
          - name: wait
            short: w
            type: bool
```

### Output Configuration

```yaml
output:
  default_format: table
  color: true
  
  formats:
    table:
      borders: true
      header: true
    json:
      pretty: true
    yaml:
      flow_style: false
```

## API Reference

### Command Management

```rust
#[async_trait]
pub trait CommandManager: Send + Sync {
    async fn register_command(&self, command: Command) -> Result<()>;
    async fn execute_command(&self, args: Vec<String>) -> Result<()>;
    async fn get_command(&self, name: &str) -> Result<Command>;
    async fn list_commands(&self) -> Result<Vec<Command>>;
}
```

### Shell Management

```rust
#[async_trait]
pub trait ShellManager: Send + Sync {
    async fn start_interactive(&self) -> Result<()>;
    async fn add_history(&self, entry: &str) -> Result<()>;
    async fn clear_history(&self) -> Result<()>;
    async fn get_history(&self) -> Result<Vec<String>>;
}
```

## Best Practices

1. **Command Design**
   - Clear hierarchy
   - Consistent naming
   - Good descriptions
   - Sensible defaults

2. **User Experience**
   - Helpful messages
   - Progress indication
   - Error handling
   - Command completion

3. **Plugin Development**
   - Clean interfaces
   - Error handling
   - Documentation
   - Version management

4. **Output Formatting**
   - Consistent formats
   - Clear presentation
   - Color usage
   - Error visibility

## Examples

### Command Creation

```rust
use clusterdb::cli::{Cli, Command, Argument};

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::new(config)?;
    
    // Create command
    let command = Command::new("greet")
        .with_description("Greet a person")
        .with_argument(Argument::new("name")
            .with_description("Person's name")
            .required(true))
        .with_handler(|ctx| async move {
            let name = ctx.arg("name")?;
            println!("Hello, {}!", name);
            Ok(())
        });
    
    cli.register_command(command).await?;
    
    // Run CLI
    cli.run().await?;
}
```

### Plugin Development

```rust
use clusterdb::cli::{Plugin, Command};

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::new(config)?;
    
    // Create plugin
    let plugin = Plugin::new("custom-commands")
        .with_version("1.0.0")
        .add_command(Command::new("custom")
            .with_description("Custom command")
            .with_handler(custom_handler));
    
    cli.register_plugin(plugin).await?;
}
```

## Integration

### With Configuration

```rust
use clusterdb::{
    cli::Cli,
    config::{Config, ConfigManager},
};

// Configure CLI with config
let config = Config::new()
    .with_file("~/.clusterdb/config.yaml")
    .with_env_prefix("CLUSTERDB_");

let cli = Cli::new(config)?;
```

### With Logging

```rust
use clusterdb::{
    cli::Cli,
    logging::{Logger, LogConfig},
};

// Configure CLI logging
let logging = LogConfig::new()
    .with_level(Level::Info)
    .with_file("~/.clusterdb/cli.log");

cli.configure_logging(logging).await?;
```

## Troubleshooting

### Common Issues

1. **Command Issues**
   ```
   Error: Unknown command
   Cause: Command not found
   Solution: Check command name
   ```

2. **Plugin Issues**
   ```
   Error: Plugin load failed
   Cause: Missing dependency
   Solution: Install dependency
   ```

3. **Completion Issues**
   ```
   Error: Completion not working
   Cause: Shell not configured
   Solution: Run completion setup
   ```

### Debugging Tools

```bash
# Check CLI version
clusterdb version

# List commands
clusterdb help

# Debug command
clusterdb --debug command
```

## Support

- [CLI Issues](https://github.com/clusterdb/clusterdb/issues)
- [CLI Documentation](https://docs.clusterdb.io/cli)
- [Community Support](https://slack.clusterdb.io)
