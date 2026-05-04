import * as pdfjsLib from 'pdfjs-dist'
import { uid, deepClone } from '../utils/helpers.js'
import { addIds } from '../utils/mindmapHelper.js'
import { MINDMAP_TEMPLATES, TOPIC_DETECTORS } from '../data/templates.js'

// Use CDN worker to avoid Vite bundler issues at module eval time
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs'

export function usePdfParser() {
  const loading = ref(false)
  const progress = ref('')

  async function parseAndGenerate(file, sectionId) {
    loading.value = true; progress.value = '读取PDF...'
    try {
      const arrayBuffer = await file.arrayBuffer()
      progress.value = '解析页面...'
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const totalPages = pdf.numPages

      // Extract text from first 200 pages (large file warning but no block)
      if (totalPages > 200) {
        progress.value = `文件较大（${totalPages}页），仅解析前200页...`
      }
      const pagesToRead = Math.min(totalPages, 200)
      let text = ''
      for (let i = 1; i <= pagesToRead; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map(it => it.str).join(' ') + '\n'
      }

      // Simulate LLM processing
      progress.value = 'AI分析中...'
      const delay = 1200 + Math.random() * 2000
      await new Promise(r => setTimeout(r, delay))

      // Generate mind map
      const tpl = MINDMAP_TEMPLATES[sectionId]
      const base = tpl ? deepClone(tpl) : { name: sectionId, children: [] }

      const keywords = TOPIC_DETECTORS[sectionId] || []
      const matched = keywords.filter(k => text.toLowerCase().includes(k.toLowerCase()))
      if (matched.length > 0) {
        const extractedNode = {
          name: `PDF: ${file.name}`,
          children: matched.slice(0, 5).map(t => ({
            name: t,
            examPoints: [`从PDF识别的「${t}」相关考点`, '建议结合教材深入学习', '历年考研重点考查内容']
          })),
          sourceFile: file.name,
          createdAt: new Date().toISOString()
        }
        base.children.push(extractedNode)
      }

      markSource(base, file.name)
      addIds(base)
      progress.value = '完成'
      return { tree: base, totalPages }
    } finally {
      loading.value = false
    }
  }

  function markSource(node, fileName) {
    node.sourceFile = fileName
    node.createdAt = new Date().toISOString()
    if (node.children) node.children.forEach(c => markSource(c, fileName))
  }

  return { loading, progress, parseAndGenerate }
}
