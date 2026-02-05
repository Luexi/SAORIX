interface ProximamenteProps {
    titulo: string
    proximamente?: boolean
}

export default function Proximamente({ titulo, proximamente = false }: ProximamenteProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className={`size-24 rounded-3xl flex items-center justify-center mb-6 ${proximamente
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-primary/10'
                }`}>
                <span className={`material-symbols-outlined text-[48px] ${proximamente
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-primary dark:text-primary-light'
                    }`}>
                    {proximamente ? 'construction' : 'rocket_launch'}
                </span>
            </div>

            <h1 className="text-2xl font-bold text-text-primary-light dark:text-white mb-2">
                {titulo}
            </h1>

            {proximamente ? (
                <>
                    <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        Próximamente
                    </div>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-md">
                        Esta funcionalidad estará disponible en una próxima actualización.
                        Estamos trabajando para traértela lo antes posible.
                    </p>
                </>
            ) : (
                <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-md">
                    Este módulo está en desarrollo. Pronto podrás gestionar {titulo.toLowerCase()} aquí.
                </p>
            )}

            <button className="mt-6 flex items-center gap-2 text-primary dark:text-primary-light font-medium hover:underline">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Volver al Dashboard
            </button>
        </div>
    )
}
