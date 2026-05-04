export const DEFAULT_SECTIONS = [
  { id: 'math',    name: '考研数学', color: 'math',    isDefault: true },
  { id: 'english', name: '考研英语', color: 'english', isDefault: true },
  { id: 'politics',name: '考研政治', color: 'politics',isDefault: true },
  { id: 'cs',      name: '408计算机', color: 'cs',      isDefault: true },
  { id: 'bagu',    name: '八股文',   color: 'bagu',    isDefault: true }
]

export const SECTION_COLORS = {
  math: '#0052FF', english: '#10B981', politics: '#EF4444',
  cs: '#8B5CF6', bagu: '#F59E0B', custom: '#0052FF'
}

export const MINDMAP_TEMPLATES = {
  math: {
    name: '考研数学', children: [
      { name: '高等数学', children: [
        { name: '函数与极限',   examPoints: ['极限四则运算','两个重要极限','无穷小比较','连续与间断判定'] },
        { name: '导数与微分',   examPoints: ['导数定义与几何意义','复合函数求导','隐函数与参数方程求导','高阶导数'] },
        { name: '不定积分',     examPoints: ['基本积分公式','换元积分法','分部积分法','有理函数积分'] },
        { name: '常微分方程',   examPoints: ['可分离变量方程','一阶线性微分方程','二阶常系数齐次方程','特解形式设定'] }
      ]},
      { name: '线性代数', children: [
        { name: '行列式', examPoints: ['行列式性质','按行/列展开','范德蒙行列式','克拉默法则'] },
        { name: '矩阵',   examPoints: ['矩阵运算','逆矩阵求法','矩阵的秩','初等变换'] },
        { name: '特征值与特征向量', examPoints: ['特征方程','特征向量求解','可对角化条件','实对称矩阵对角化'] }
      ]},
      { name: '概率论与数理统计', children: [
        { name: '随机事件与概率', examPoints: ['条件概率与乘法公式','全概率公式','贝叶斯公式','独立性判定'] },
        { name: '随机变量与分布', examPoints: ['分布函数性质','常见离散分布','常见连续分布','正态分布标准化'] }
      ]}
    ]
  },
  english: {
    name: '考研英语', children: [
      { name: '阅读理解', children: [
        { name: '细节理解题', examPoints: ['定位原文关键信息','同义替换识别','排除干扰项','数据与事实匹配'] },
        { name: '推理判断题', examPoints: ['隐含意义推断','作者态度识别','上下文逻辑推理','段落主旨概括'] },
        { name: '主旨大意题', examPoints: ['全文主旨概括','最佳标题选择','作者写作目的','篇章结构分析'] }
      ]},
      { name: '写作', children: [
        { name: '小作文', examPoints: ['书信格式','通知/备忘录格式','语气得体','要点全覆盖'] },
        { name: '大作文', examPoints: ['图表/图画描述','现象分析角度','原因与影响阐述','建议与展望'] }
      ]}
    ]
  },
  politics: {
    name: '考研政治', children: [
      { name: '马克思主义基本原理', children: [
        { name: '唯物辩证法', examPoints: ['对立统一规律','量变质变规律','否定之否定规律','五对基本范畴'] },
        { name: '认识论', examPoints: ['实践与认识的辩证关系','认识的两次飞跃','真理的绝对性与相对性','检验真理的标准'] }
      ]},
      { name: '毛中特', children: [
        { name: '新民主主义革命理论', examPoints: ['革命总路线','农村包围城市道路','三大法宝','新民主主义社会性质'] },
        { name: '习近平新时代中国特色社会主义思想', examPoints: ['八个明确','十四个坚持','中国式现代化','高质量发展'] }
      ]}
    ]
  },
  cs: {
    name: '408计算机专业基础', children: [
      { name: '数据结构', children: [
        { name: '线性表', examPoints: ['顺序表与链表比较','单链表基本操作','双链表与循环链表','栈与队列应用'] },
        { name: '树与二叉树', examPoints: ['二叉树遍历','二叉搜索树','平衡二叉树AVL','哈夫曼树与编码'] },
        { name: '图', examPoints: ['邻接矩阵/邻接表','DFS与BFS','最小生成树','最短路径','拓扑排序'] },
        { name: '排序', examPoints: ['快速排序','堆排序','归并排序','复杂度比较','稳定性分析'] }
      ]},
      { name: '计算机组成原理', children: [
        { name: '数据表示与运算', examPoints: ['原/反/补/移码','IEEE754浮点数','ALU设计','定点/浮点运算'] },
        { name: '存储系统', examPoints: ['Cache映射','虚拟存储器','页/段/段页式','TLB'] },
        { name: '指令系统与CPU', examPoints: ['指令格式寻址','指令流水线','数据/控制冒险','CISC vs RISC'] }
      ]},
      { name: '操作系统', children: [
        { name: '进程管理', examPoints: ['进程状态转换','同步与互斥','死锁银行家算法','PV操作'] },
        { name: '内存管理', examPoints: ['连续分配','分页分段','页面置换算法','缺页率计算'] }
      ]},
      { name: '计算机网络', children: [
        { name: 'TCP/IP协议栈', examPoints: ['OSI七层','TCP握手/挥手','拥塞控制','UDP特点'] },
        { name: '应用层协议', examPoints: ['HTTP/HTTPS','DNS解析','FTP','SMTP/POP3'] }
      ]}
    ]
  },
  bagu: {
    name: '前端八股', children: [
      { name: 'JavaScript核心', children: [
        { name: '闭包与作用域', examPoints: ['闭包定义与原理','作用域链','内存泄漏','防抖/节流/模块化'] },
        { name: '原型链与继承', examPoints: ['prototype与__proto__','原型链查找','ES6 class','instanceof'] },
        { name: '异步编程', examPoints: ['Event Loop宏/微任务','Promise/A+','async/await','并发控制'] }
      ]},
      { name: 'CSS布局', children: [
        { name: '盒模型与BFC', examPoints: ['标准vs IE盒模型','box-sizing','BFC触发','margin重叠'] },
        { name: 'Flex与Grid', examPoints: ['Flex容器属性','Flex项目属性','Grid模板','区域命名对齐'] }
      ]},
      { name: 'React/Vue', children: [
        { name: 'React Hooks', examPoints: ['useState/useReducer','useEffect清理','useMemo/useCallback','自定义Hook'] },
        { name: '性能优化', examPoints: ['虚拟列表','React.lazy','memo','不可变数据'] }
      ]},
      { name: '网络与浏览器', children: [
        { name: 'HTTP协议', examPoints: ['HTTP1.1/2/3','HTTPS原理','缓存策略','跨域方案'] },
        { name: '浏览器渲染', examPoints: ['DOM/CSSOM构建','回流与重绘','合成层GPU加速','async/defer'] }
      ]}
    ]
  }
}

export const TOPIC_DETECTORS = {
  math: ['极限','导数','积分','矩阵','概率','微分','特征值','行列式'],
  english: ['reading','write','translate','vocabulary','grammar','essay','comprehension'],
  politics: ['矛盾','实践','社会主义','现代化','价值','人民','发展','改革'],
  cs: ['算法','数据结构','排序','进程','TCP','Cache','操作','网络','页面','信号'],
  bagu: ['闭包','Promise','React','CSS','HTTP','原型','async','组件','Hook','虚拟']
}
