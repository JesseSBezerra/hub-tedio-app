'use client'

import { FileText, Folder } from 'lucide-react'

export default function FilesPage() {
  const files = [
    { name: 'documento.pdf', size: '2.4 MB', type: 'PDF' },
    { name: 'imagem.png', size: '1.8 MB', type: 'Imagem' },
    { name: 'projeto/', size: '45 MB', type: 'Pasta' },
  ]

  return (
    <div className="space-y-6">
      <div className="terminal-border p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">
          {'>'} FILES
        </h1>
        
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 border border-primary hover:bg-primary hover:text-background transition-colors">
              {file.type === 'Pasta' ? (
                <Folder className="w-5 h-5 text-secondary" />
              ) : (
                <FileText className="w-5 h-5 text-secondary" />
              )}
              <div className="flex-1">
                <div className="text-primary font-bold">{file.name}</div>
                <div className="text-xs text-muted-foreground">{file.size}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
