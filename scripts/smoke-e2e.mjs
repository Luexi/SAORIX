import { spawn } from 'node:child_process'

const projectRoot = process.cwd()
const sqliteUrl = 'file:./saori.db'
const apiHost = '127.0.0.1'
const apiPort = '3011'
const apiBaseUrl = `http://${apiHost}:${apiPort}/api`

function runCommand(command, args, extraEnv = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(`${command} ${args.join(' ')}`, {
            cwd: projectRoot,
            env: { ...process.env, ...extraEnv },
            stdio: 'inherit',
            shell: true,
        })

        child.on('error', reject)
        child.on('exit', (code) => {
            if (code === 0) {
                resolve()
                return
            }
            reject(new Error(`Command failed: ${command} ${args.join(' ')}`))
        })
    })
}

function startServer(runtimeEnv) {
    const serverProcess = spawn(process.execPath, ['dist-electron/server/index.js'], {
        cwd: projectRoot,
        env: { ...process.env, ...runtimeEnv },
        stdio: ['ignore', 'pipe', 'pipe'],
    })

    serverProcess.stdout.on('data', (chunk) => process.stdout.write(chunk))
    serverProcess.stderr.on('data', (chunk) => process.stderr.write(chunk))
    return serverProcess
}

async function waitForHealth(maxAttempts = 60) {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
            const response = await fetch(`${apiBaseUrl}/health`)
            if (response.ok) {
                return
            }
        } catch {
            // Retry until timeout
        }
        await new Promise((resolve) => setTimeout(resolve, 500))
    }
    throw new Error('Smoke E2E timeout waiting for /api/health')
}

function assertResponseOk(response, label) {
    if (!response.ok) {
        throw new Error(`${label} failed with status ${response.status}`)
    }
}

async function runSmokeFlow() {
    const loginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'admin@saori.local', password: 'admin123' }),
    })
    assertResponseOk(loginResponse, 'login')
    const loginData = await loginResponse.json()

    const authHeaders = {
        authorization: `Bearer ${loginData.token}`,
        'content-type': 'application/json',
    }

    const supplierResponse = await fetch(`${apiBaseUrl}/suppliers`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name: `Proveedor Smoke ${Date.now()}` }),
    })
    assertResponseOk(supplierResponse, 'create supplier')
    const supplier = await supplierResponse.json()

    const productsResponse = await fetch(`${apiBaseUrl}/products`, {
        method: 'GET',
        headers: authHeaders,
    })
    assertResponseOk(productsResponse, 'list products')
    const products = await productsResponse.json()
    if (!products.length) {
        throw new Error('No products available for smoke test')
    }

    const purchaseResponse = await fetch(`${apiBaseUrl}/purchases`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
            supplierId: supplier.id,
            branchId: loginData.user.branchId,
            items: [{ productId: products[0].productId, quantityOrdered: 2, unitCost: 10 }],
        }),
    })
    assertResponseOk(purchaseResponse, 'create purchase')
    const purchase = await purchaseResponse.json()

    const receiveResponse = await fetch(`${apiBaseUrl}/purchases/${purchase.id}/receive`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
            items: [{ itemId: purchase.items[0].id, quantityReceived: 2 }],
        }),
    })
    assertResponseOk(receiveResponse, 'receive purchase')
    const receivedPurchase = await receiveResponse.json()

    const leadResponse = await fetch(`${apiBaseUrl}/leads`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
            name: `Lead Smoke ${Date.now()}`,
            status: 'NEW',
            nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
    })
    assertResponseOk(leadResponse, 'create lead')

    const remindersResponse = await fetch(`${apiBaseUrl}/leads/reminders?days=7`, {
        method: 'GET',
        headers: authHeaders,
    })
    assertResponseOk(remindersResponse, 'list reminders')
    const reminders = await remindersResponse.json()

    console.log(`smoke-e2e OK purchaseStatus=${receivedPurchase.status} reminders=${reminders.length}`)
}

async function main() {
    const testEnv = {
        DATABASE_URL: sqliteUrl,
    }

    await runCommand('npm', ['run', 'prisma:seed'], testEnv)

    const runtimeEnv = {
        NODE_ENV: 'production',
        DATABASE_URL: sqliteUrl,
        JWT_SECRET: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        API_HOST: apiHost,
        PORT: apiPort,
    }

    const serverProcess = startServer(runtimeEnv)

    try {
        await waitForHealth()
        await runSmokeFlow()
    } finally {
        serverProcess.kill('SIGTERM')
        await new Promise((resolve) => setTimeout(resolve, 600))
        if (!serverProcess.killed) {
            serverProcess.kill('SIGKILL')
        }
    }
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
