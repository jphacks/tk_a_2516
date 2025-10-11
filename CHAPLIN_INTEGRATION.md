# Chaplin Integration Notes

- The upstream Chaplin repository is vendored in `chaplin/` unchanged so that future updates can be synced cleanly.
- Retain `chaplin/LICENSE` whenever Chaplin code is redistributed; it carries the original MIT notice from Amanvir Parhar.
- Python build artifacts (virtual environments, `__pycache__`, wheel bundles, etc.) are ignored globally through the updated root `.gitignore`.
- To experiment locally, create a virtual environment and run `pip install -r chaplin/requirements.txt`; keep the environment outside the repo or under a name ignored by Git.
- Record the upstream commit or release tag you imported in your PR description to make future updates traceable.
