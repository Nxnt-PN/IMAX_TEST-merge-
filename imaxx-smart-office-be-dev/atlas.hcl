data "external_schema" "gorm" {
  program = [
  "go",
  "run",
  "-mod=mod",
  "./loader"
  ]
}

locals {
  database_url = getenv("DATABASE_URL")
}

env "gorm" {
  url = local.database_url
  src = data.external_schema.gorm.url
  dev = "docker://postgres/16/dev?search_path=public"
  migration {
    dir = "file://migrations"
  }
  lint {
    destructive {
      error = true
    }
  }
  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}

env "local" {
  url = local.database_url
  src = data.external_schema.gorm.url
  dev = "docker://postgres/16/dev?search_path=public"
  migration {
    dir = "file://migrations"
  }
  lint {
    destructive {
      error = true
    }
  }
  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}
