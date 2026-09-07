mod cli;
mod commands;

use clap::Parser;
use cli::{Cli, Commands};
use std::io::Write;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Ranking { sector, market, .. } => {
            let s = commands::ranking::run_validated(&cli.market, market.as_deref(), sector);
            println!("{s}");
        }
        Commands::Score { ticker, market, .. } => {
            let s = commands::score::run_validated(&cli.market, market.as_deref(), ticker);
            println!("{s}");
        }
        Commands::Dossier {
            ticker,
            pdf,
            market,
            ..
        } => {
            let b = commands::dossier::run_validated(&cli.market, market.as_deref(), ticker, pdf);
            if pdf && b.starts_with(b"%PDF") {
                std::io::stdout().write_all(&b)?;
            } else {
                println!("{}", String::from_utf8_lossy(&b));
            }
        }
        Commands::Scan {
            tickers, market, ..
        } => {
            let s = commands::scan::run_validated(&cli.market, market.as_deref(), tickers);
            println!("{s}");
        }
    }
    Ok(())
}
