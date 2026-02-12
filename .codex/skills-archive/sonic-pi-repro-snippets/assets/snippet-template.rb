# Snippet: <name>
# Intent: <one sentence>
# Params: <list with safe ranges>
# Seeded demo: <seed value>

define :<snippet_name> do |density: 0.5, seed: 1234|
  use_random_seed seed
  # Pattern goes here.
end

# Example:
# <snippet_name>(density: 0.7, seed: 42)
