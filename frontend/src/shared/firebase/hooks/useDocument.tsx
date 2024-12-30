import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react'

import { debounce } from '@/shared/firebase/debounce.ts'

import { GetDocumentParams, getDocument, setDocument as setDocumentInDb } from '../DocumentsDAO.ts'
import { FSDocument } from '../types.ts'

interface BaseUseDocumentResponse<T> {
    setDocument: (doc: Partial<T>) => Promise<void>
    setDocumentSync: (doc: Partial<T>) => Promise<void>
    isLoading: boolean
}

interface UseDocumentResponseWithoutDefault<T> extends BaseUseDocumentResponse<T> {
    document?: T
}

interface UseDocumentResponseWithDefault<T> extends BaseUseDocumentResponse<T> {
    document: T
}

type UseDocumentPropsWithoutDefault<T> = GetDocumentParams<T> & {
    defaultValue?: undefined
}

type UseDocumentPropsWithDefault<T> = GetDocumentParams<T> & {
    defaultValue: T
}

type DocumentStore = Record<string, FSDocument | undefined>

type DocumentsContextValue = {
    documentsStore: DocumentStore
    setDocument: (key: string, value?: FSDocument) => void
}

const DocumentsContext = createContext<DocumentsContextValue | undefined>(undefined)

export const DocumentsProvider = ({ children }: PropsWithChildren) => {
    const [documentsStore, setDocumentsStore] = useState<DocumentStore>({})

    const setDocument = (key: string, value?: FSDocument) =>
        setDocumentsStore(prevStore => ({ ...prevStore, [key]: value }))

    return <DocumentsContext.Provider value={{ setDocument, documentsStore }}>{children}</DocumentsContext.Provider>
}

export function useDocument<T extends FSDocument>({
    collectionName,
    id,
}: UseDocumentPropsWithoutDefault<T>): UseDocumentResponseWithoutDefault<T>
export function useDocument<T extends FSDocument>({
    collectionName,
    id,
    defaultValue,
}: UseDocumentPropsWithDefault<T>): UseDocumentResponseWithDefault<T>

export function useDocument<T extends FSDocument>({
    collectionName,
    id,
    defaultValue = undefined,
}: UseDocumentPropsWithDefault<T> | UseDocumentPropsWithoutDefault<T>):
    | UseDocumentResponseWithoutDefault<T>
    | UseDocumentResponseWithDefault<T> {
    const context = useContext(DocumentsContext)

    if (!context) throw new Error('useDocument must be used inside a DocumentsProvider')

    const { setDocument: setDocumentInStore, documentsStore } = context

    const docPath = `${collectionName}/${id}`
    const document = (documentsStore[docPath] as T) ?? defaultValue
    // Using callback to avoid recreation of the debounce function as it needs to store the timeuot ID
    const setDocumentInDbDebounced = useCallback(debounce(setDocumentInDb, 1000), [collectionName, id])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDoc = async () => {
            if (id) {
                const doc = await getDocument<T>({
                    collectionName,
                    id,
                    onDocumentChange: (doc: T) => setDocumentInStore(docPath, doc),
                })
                if (doc === undefined && defaultValue !== undefined) {
                    setIsLoading(false)
                    return
                }
                setDocumentInStore(docPath, doc)
                setIsLoading(false)
            }
        }

        fetchDoc()
    }, [collectionName, id])

    const setDocument = async (doc: Partial<T>) => {
        const updatedDocument = { ...document, ...doc }
        setDocumentInStore(docPath, updatedDocument)
        setDocumentInDbDebounced({ collectionName, id: (updatedDocument.id ?? id)!, data: updatedDocument })
    }

    const setDocumentSync = async (doc: Partial<T>) => {
        const updatedDocument = { ...document, ...doc }
        setDocumentInStore(docPath, updatedDocument)
        await setDocumentInDb({ collectionName, id: id!, data: updatedDocument })
    }

    return {
        document,
        setDocument,
        setDocumentSync,
        isLoading,
    }
}
