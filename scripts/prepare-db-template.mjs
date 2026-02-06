import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const projectRoot = process.cwd()
const migrationsDir = path.join(projectRoot, 'prisma', 'migrations')
const templateDir = path.join(projectRoot, 'build-resources')
const templateDbPath = path.join(templateDir, 'saori-template.db')
const templateUrl = `file:${templateDbPath.replace(/\\/g, '/')}`

function run(command, args, envOverrides = {}) {
    execSync(`${command} ${args.join(' ')}`, {
        cwd: projectRoot,
        stdio: 'inherit',
        env: {
            ...process.env,
            ...envOverrides,
        },
        shell: true,
    })
}

function ensureTemplateDirectory() {
    if (!fs.existsSync(templateDir)) {
        fs.mkdirSync(templateDir, { recursive: true })
    }
}

function resetTemplateFile() {
    if (fs.existsSync(templateDbPath)) {
        fs.rmSync(templateDbPath, { force: true })
    }
}

function getOrderedMigrationFiles() {
    const entries = fs.readdirSync(migrationsDir, { withFileTypes: true })
    return entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b))
        .map((migrationName) => path.join(migrationsDir, migrationName, 'migration.sql'))
        .filter((migrationPath) => fs.existsSync(migrationPath))
}

function applyMigrations(templatePath) {
    const migrationFiles = getOrderedMigrationFiles()
    if (migrationFiles.length === 0) {
        throw new Error('No se encontraron migraciones para construir la DB plantilla')
    }

    const db = new DatabaseSync(templatePath)
    try {
        for (const migrationFile of migrationFiles) {
            const sql = fs.readFileSync(migrationFile, 'utf8')
            db.exec(sql)
            console.log(`Migracion aplicada: ${path.basename(path.dirname(migrationFile))}`)
        }
    } finally {
        db.close()
    }
}

function main() {
    ensureTemplateDirectory()
    resetTemplateFile()
    applyMigrations(templateDbPath)

    // Keep baseline records (admin user, branch, catalogs) expected by login and initial screens.
    run('npm', ['run', 'prisma:seed'], { DATABASE_URL: templateUrl })

    if (!fs.existsSync(templateDbPath)) {
        throw new Error('No se genero la DB plantilla para empaquetado')
    }

    const stats = fs.statSync(templateDbPath)
    console.log(`DB plantilla lista: ${templateDbPath} (${stats.size} bytes)`)
}

main()
