import {Plugin, ViteDevServer} from "vite"
import path from "path"
import fs from "fs-extra"
import {v2} from '@google-cloud/translate'

const translate = new v2.Translate({projectId: 'dondersteen-resort'})

const queue: (() => Promise<void>)[] = []
let isProcessing = false

async function processQueue() {
    if (isProcessing || queue.length === 0) return
    isProcessing = true
    const task = queue.shift()
    if (task) await task()
    isProcessing = false
    processQueue()
}

export function createTranslationsMiddleware(): Plugin {
    return {
        name: 'save-translation-middleware',
        apply: 'serve',
        configureServer(server: ViteDevServer) {
            server.middlewares.use(async (req, res, next) => {
                if (req.method !== 'POST') return next()

                // Match the URL against the expected pattern
                const match = req.url!.match(/^\/locales\/(?<lng>\w+)\/(?<ns>\w+)\.json$/)
                if (!match || !match.groups) {
                    return next() // If the URL doesn't match, pass to the next middleware
                }

                console.log('Adding new translations:', req.url)
                const {lng, ns} = match.groups

                let body = ''
                req.on('data', (chunk) => {
                    body += chunk.toString()
                })

                req.on('end', async () => {
                    queue.push(async () => {
                        try {
                            const translationsPath = path.join(__dirname, `public/locales/${lng}/${ns}.json`)
                            // If translations not exist, create it
                            if (!await fs.pathExists(translationsPath)) {
                                await fs.ensureFile(translationsPath)
                                await fs.writeJson(translationsPath, {})
                            }
                            const existingTranslations = await fs.readJson(translationsPath)

                            console.log('New translations:', body)
                            // Parse the request body to extract new translation keys and values
                            const newTranslations = JSON.parse(body)

                            // Merge the new translations with the existing ones
                            const updatedTranslations = {...existingTranslations, ...newTranslations}

                            // Automatically translate new keys if the language is not English
                            if (lng !== 'en') {
                                for (const key in newTranslations) {
                                    if (
                                        Object.prototype.hasOwnProperty.call(newTranslations, key)
                                        && !existingTranslations[key]
                                    ) {
                                        console.log('Translating: ', key)
                                        const [translation] = await translate.translate(newTranslations[key], lng)
                                        updatedTranslations[key] = translation
                                        console.log('Added translation: ', translation)
                                    }
                                }
                            }

                            // Write the updated translations back to the file
                            await fs.writeJson(translationsPath, updatedTranslations, {spaces: 2})

                            res.writeHead(200, {'Content-Type': 'text/plain'})
                            res.end('Missing key(s) saved successfully')
                        } catch (err) {
                            console.error('Failed to update translations', err)
                            res.writeHead(500, {'Content-Type': 'text/plain'})
                            res.end('Failed to update translations')
                        }
                    })
                    processQueue()
                })
            })
        },
    }
}
