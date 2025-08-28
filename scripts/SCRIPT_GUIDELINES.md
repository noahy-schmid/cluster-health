# Script Development Guidelines

## Path Conventions

### Home Directory References
- **Always use `~/` for home directory paths in shell scripts**
- Avoid `$HOME/` or `/home/$USER/` as they may not work correctly in all SSH/shell contexts
- Example: `COMPOSE_FILE="~/docker-compose.pr-$PR_NUMBER.yml"`

### Script Placement
- All deployment scripts should be placed in the user's home directory (`~/`) on the DigitalOcean droplet
- Use `~/` in documentation comments to indicate script placement location

## Examples

✅ **Correct:**
```bash
COMPOSE_FILE="~/docker-compose.pr-$PR_NUMBER.yml"
# This script should be placed at ~/deploy-docker-pr.sh on the DigitalOcean droplet
```

❌ **Avoid:**
```bash
COMPOSE_FILE="$HOME/docker-compose.pr-$PR_NUMBER.yml"
COMPOSE_FILE="/home/$USER/docker-compose.pr-$PR_NUMBER.yml"
# This script should be placed at /home/$USER/deploy-docker-pr.sh on the DigitalOcean droplet
```