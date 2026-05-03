export const MOCK_QUESTIONS = {
  math: [
    { question:'求极限 lim(x→0) (1-cos x)/x²', answer:'= 1/2。利用等价无穷小 1-cos x ~ x²/2', type:'简答' },
    { question:'f(x)在[a,b]连续、(a,b)可导且f(a)=f(b)，则∃ξ∈(a,b)使f\'(ξ)=0。此定理名称？', answer:'罗尔定理', type:'填空' },
    { question:'矩阵 A=[[1,1],[0,1]] 的秩为？', answer:'秩为2（满秩）', type:'填空' },
    { question:'解微分方程 dy/dx = y/x + x', answer:'一阶线性，通解 y = Cx + x²', type:'简答' },
    { question:'X~N(0,1)，P(-1<X<1) 约等于？', answer:'≈ 0.6827', type:'填空' }
  ],
  english: [
    { question:'"mitigate" is closest in meaning to ____.', answer:'alleviate / reduce（减轻、缓解）', type:'选择' },
    { question:'翻译: The swift development of AI has brought unprecedented challenges to traditional education.', answer:'人工智能的快速发展给传统教育带来了前所未有的挑战。', type:'简答' },
    { question:'"Time is a thief" uses which rhetorical device?', answer:'Metaphor（隐喻）', type:'填空' },
    { question:'写出英语书信的基本格式要素。', answer:'称呼→正文三段→结束语→签名', type:'简答' }
  ],
  politics: [
    { question:'简述矛盾普遍性与特殊性的辩证关系。', answer:'普遍性寓于特殊性之中，特殊性包含普遍性。共性与个性、绝对与相对的关系。', type:'简答' },
    { question:'为什么说人民群众是历史的创造者？', answer:'①物质财富创造者 ②精神财富创造者 ③社会变革决定力量', type:'简答' },
    { question:'中国式现代化的本质要求包括几个方面？', answer:'九个方面', type:'填空' }
  ],
  cs: [
    { question:'快速排序最坏时间复杂度及场景？', answer:'O(n²)，每次划分极不平衡时（如已有序选首元素为枢轴）', type:'简答' },
    { question:'TCP拥塞控制包含哪四个阶段？', answer:'慢启动、拥塞避免、快速重传、快速恢复', type:'简答' },
    { question:'死锁四条件不包括？A.互斥 B.请求保持 C.循环等待 D.公平调度', answer:'D。四条件：互斥、请求保持、不可剥夺、循环等待', type:'选择' },
    { question:'会出现Belady异常的页面置换算法是？', answer:'FIFO', type:'填空' },
    { question:'TCP为什么是三次握手而非两次？', answer:'防止失效连接请求导致错误建立连接，同时实现双向序列号同步', type:'简答' }
  ],
  bagu: [
    { question:'什么是Event Loop？宏任务和微任务的区别？', answer:'JS异步机制。宏任务:script/setTimeout；微任务:Promise.then。每次宏任务后清空所有微任务。', type:'简答' },
    { question:'React中为什么不能在循环/条件中调用Hooks？', answer:'React依赖Hooks调用顺序维护状态，打乱顺序导致状态错乱。', type:'简答' },
    { question:'触发BFC的条件不包括？A.overflow:visible B.float:left C.position:absolute D.display:flex', answer:'A。需overflow不为visible', type:'选择' },
    { question:'写出3种以上跨域解决方案。', answer:'CORS、JSONP、代理、postMessage、WebSocket、Nginx反向代理', type:'简答' }
  ]
}

export const QUESTION_TYPES = ['简答', '选择', '填空']
