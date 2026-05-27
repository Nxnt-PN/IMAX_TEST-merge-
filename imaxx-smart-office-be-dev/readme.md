# iMAXX Smart Office
using golang v. 1.25.5
## Run API

Normal Run
```
go run main.go
```

Run with seed data
```
go run main.go -seed=t
```

Run with hot-reload (Install Air before run)
```
air
```


## DB Migration

have to install atlas first https://atlasgo.io/docs

Add migration file (model change diff check)
```
atlas migrate diff <migration_name> --env gorm 
```
Remove migration file
```
atlas migrate rm <filename>
```

Apply migration (Run script to database)
```
atlas migrate apply --env gorm --url "postgres://dbuser:Asdlkj123@:5432/imaxx_office?search_path=public&sslmode=disable"
```

Apply migration (Run script to database) *with truncate all table
```
scripts\reset-db
```

Down migration (rollback on database)
```
atlas migrate down --url "postgres://dbuser:Asdlkj123@:5432/imaxx_office?search_path=public&sslmode=disable" --dev-url "docker://postgres/15/dev?search_path=public"
```

## Swagger Usage
install tools
```
go install github.com/swaggo/swag/cmd/swag@latest
swag --version
```

update swagger docs
```
swag init
```

# Air (Live Reload for go apps)
install tools
```
go install github.com/air-verse/air@latest
air -v
```