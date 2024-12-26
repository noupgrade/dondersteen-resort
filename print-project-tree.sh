#!/bin/bash

# Check if .gitignore exists
if [[ ! -f .gitignore ]]; then
  echo ".gitignore file not found!"
  exit 1
fi

# Read .gitignore and prepare the exclusion patterns for the tree command
exclude_patterns=$(grep -v '^#' .gitignore | grep -v '^$' | sed 's/$/|/' | tr -d '\n' | sed 's/|$//')

# Execute the tree command with the exclusion patterns.
# If you don´t have tree, install it with `brew install tree` or `sudo apt-get install tree`
tree -I "$exclude_patterns" "$@"
