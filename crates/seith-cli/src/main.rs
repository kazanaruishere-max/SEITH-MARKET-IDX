use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "seith", version, about = "SEITH Market Intelligence CLI")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
    #[arg(long, default_value = "id", value_parser = clap::value_parser!(String))]
    market: String,
}

#[derive(Subcommand)]
enum Commands {
    Ranking {
        #[arg(long)]
        sector: Option<String>,
    },
    Dossier {
        ticker: String,
        #[arg(long)]
        pdf: bool,
    },
    Scan {
        #[arg(long)]
        tickers: String,
    },
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Ranking { sector } => {
            println!(
                "{}",
                serde_json::json!({"success": true, "data": {"market": cli.market, "sector": sector}})
            );
        }
        Commands::Dossier { ticker, pdf } => {
            println!(
                "{}",
                serde_json::json!({"success": true, "data": {"ticker": ticker, "pdf": pdf, "market": cli.market}})
            );
        }
        Commands::Scan { tickers } => {
            let list: Vec<&str> = tickers.split(',').collect();
            println!(
                "{}",
                serde_json::json!({"success": true, "data": {"tickers": list, "market": cli.market}})
            );
        }
    }
    Ok(())
}
