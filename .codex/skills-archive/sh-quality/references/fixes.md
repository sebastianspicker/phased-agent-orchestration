# Shell quality fixes (examples)

## Safer iteration over files
Bad:
```sh
for f in $(ls *.txt); do
  ...
done
```
Better (bash):
```bash
shopt -s nullglob
for f in *.txt; do
  ...
done
```

## Avoid `echo` edge cases
Prefer:
```sh
printf '%s\n' "$value"
```

## Preserve newlines safely
Prefer:
```sh
printf '%s\n' "$text"
```
over:
```sh
echo "$text"
```
