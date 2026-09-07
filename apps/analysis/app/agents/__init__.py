"""3-agent Lite re-export surface."""
from .fundamental import run as fundamental_run
from .synthesizer import run as synthesizer_run
from .technical import run as technical_run

__all__ = ["fundamental_run", "synthesizer_run", "technical_run"]
