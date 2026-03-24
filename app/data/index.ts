export type SchoolKey = 'CMU' | 'Duke' | 'Penn' | 'Cornell' | 'NYU' | 'Columbia'

export type ContentType =
  | '文章'
  | '申请文书'
  | '问答'
  | 'Tips'
  | '清单'
  | '推荐'
  | '校园生活'
  | '选校建议'
  | '学术'
  | '随笔'
  | '公开问答'

export interface AmbassadorContent {
  type: ContentType
  title: string
}

export interface Ambassador {
  id: string
  name: string
  school: SchoolKey
  dept: string
  year: string
  bio: string
  postCount: number
  contents: AmbassadorContent[]
}

export interface Comment {
  id: string
  authorName: string
  authorYear: string
  daysAgo: number
  content: string
  isAmbassador?: boolean
  ambassadorSchool?: SchoolKey
}

export interface FeedPost {
  kind: 'article'
  id: string
  title: string
  summary: string
  school: SchoolKey
  contentType: ContentType
  authorName: string
  views: number
  daysAgo: number
  pinned?: boolean
}

export interface EssayPost {
  kind: 'essay'
  id: string
  school: SchoolKey
  contentType: '随笔'
  authorName: string
  authorYear: string
  daysAgo: number
  views: number
  body: string
  comments: Comment[]
}

export interface QAPost {
  kind: 'qa'
  id: string
  school: SchoolKey
  contentType: '公开问答'
  daysAgo: number
  views: number
  question: string
  questionYear: string
  questionDaysAgo: number
  answerAuthorName: string
  answerAuthorYear: string
  answer: string
  comments: Comment[]
}

export type FeedItem = FeedPost | EssayPost | QAPost

export const schoolColors: Record<SchoolKey, { bg: string; fg: string }> = {
  CMU:      { bg: '#E8F0FC', fg: '#1F4388' },
  Duke:     { bg: '#E1F0EB', fg: '#0A4A35' },
  Penn:     { bg: '#EEEDFB', fg: '#3C3489' },
  Cornell:  { bg: '#FAF0E0', fg: '#6B3A08' },
  NYU:      { bg: '#FAE8E8', fg: '#7A2020' },
  Columbia: { bg: '#EBF3E0', fg: '#2A5010' },
}

export const contentTypeColors: Record<ContentType, { bg: string; fg: string }> = {
  '文章':    { bg: '#FAE8E8', fg: '#A83131' },
  '申请文书': { bg: '#FAE8E8', fg: '#A83131' },
  '问答':    { bg: '#F5E0E0', fg: '#8C2020' },
  'Tips':   { bg: '#FAEEED', fg: '#993025' },
  '清单':    { bg: '#F7E6E6', fg: '#7A2828' },
  '推荐':    { bg: '#F5E8E8', fg: '#9C3030' },
  '校园生活': { bg: '#FAE8E8', fg: '#A83131' },
  '选校建议': { bg: '#F5E0E0', fg: '#8C2020' },
  '学术':    { bg: '#FAEEED', fg: '#993025' },
  '随笔':    { bg: '#F7E6E6', fg: '#7A2828' },
  '公开问答': { bg: '#F5E8E8', fg: '#9C3030' },
}

export const ambassadors: Ambassador[] = [
  {
    id: 'zhang-mingyuan',
    name: '张明远',
    school: 'CMU',
    dept: '计算机科学',
    year: '2024届',
    bio: '专注CS申请文书和CMU校园生活',
    postCount: 6,
    contents: [
      { type: '文章', title: '从四中到CMU SCS：我的文书到底写了什么' },
      { type: 'Tips', title: '选CMU还是MIT？工科选校的三个核心维度' },
    ],
  },
  {
    id: 'li-xiaotong',
    name: '李晓彤',
    school: 'Duke',
    dept: '经济',
    year: '2023届',
    bio: '聊Duke校园生活和文理学院选课逻辑',
    postCount: 5,
    contents: [
      { type: '问答', title: 'Duke的双录取项目值得申请吗' },
      { type: '文章', title: 'Duke第一年：我最后悔没提前知道的五件事' },
    ],
  },
  {
    id: 'chen-siyuan',
    name: '陈思远',
    school: 'Penn',
    dept: 'Wharton 商科',
    year: '2023届',
    bio: '商科选校和申请策略，同时拿过Wharton和Stern',
    postCount: 4,
    contents: [
      { type: '文章', title: 'Wharton vs. 其他商科：从四中学生的角度怎么选' },
      { type: '清单', title: '商科申请必看的十个校园资源' },
    ],
  },
  {
    id: 'wang-zixuan',
    name: '王子轩',
    school: 'Cornell',
    dept: '机械工程',
    year: '2024届',
    bio: '理工申请和Cornell工程课程压力',
    postCount: 3,
    contents: [
      { type: '文章', title: 'Cornell工程的课程压力：真实的一个学期是什么样的' },
      { type: '问答', title: '工程申请要不要写研究经历' },
    ],
  },
  {
    id: 'zhao-yuxin',
    name: '赵雨欣',
    school: 'NYU',
    dept: '电影制作',
    year: '2023届',
    bio: '艺术类申请和作品集准备',
    postCount: 2,
    contents: [
      { type: 'Tips', title: '艺术作品集最常犯的五个错误' },
      { type: '推荐', title: '我在NYU Tisch最喜欢的三门课' },
    ],
  },
  {
    id: 'liu-yutong',
    name: '刘雨桐',
    school: 'Columbia',
    dept: '社会学',
    year: '2024届',
    bio: '哥大城市生活和文社科申请思路',
    postCount: 2,
    contents: [
      { type: '文章', title: '哥大城市生活和文社科申请思路' },
      { type: '问答', title: '哥大的Core Curriculum真的值得吗' },
    ],
  },
]

export const feedPosts: FeedPost[] = [
  {
    kind: 'article',
    id: 'cmu-essay',
    title: '从四中到CMU SCS：我的文书到底写了什么',
    summary: '申请文书不是简历。从外婆家一本发黄的数学题集，到信息竞赛，再到CMU SCS的录取——写作思路比结果本身更值得分享。',
    school: 'CMU',
    contentType: '申请文书',
    authorName: '张明远',
    views: 1200,
    daysAgo: 3,
    pinned: true,
  },
  {
    kind: 'article',
    id: 'duke-first-year',
    title: 'Duke第一年：我最后悔没提前知道的五件事',
    summary: '有五件事，我来Duke之前完全没想到。有遗憾，也有意外的惊喜。不是炫耀，也不是抱怨——只是想把真实的经历写出来，给正在申请、还没来得及想象"大一是什么样的"的同学看看。',
    school: 'Duke',
    contentType: '校园生活',
    authorName: '李晓彤',
    views: 876,
    daysAgo: 7,
  },
  {
    kind: 'article',
    id: 'wharton-vs-others',
    title: 'Wharton vs. 其他商科：从四中学生的角度怎么选',
    summary: '同时收到Wharton和Stern。我只花了三周就决定了，理由不是排名。',
    school: 'Penn',
    contentType: '选校建议',
    authorName: '陈思远',
    views: 654,
    daysAgo: 14,
  },
  {
    kind: 'article',
    id: 'cornell-engineering',
    title: 'Cornell工程的课程压力：真实的一个学期是什么样的',
    summary: '五门课，三门满学分上机课。不是励志故事，只是Cornell工程课程压力的真实记录，数据和感受都有。',
    school: 'Cornell',
    contentType: '学术',
    authorName: '王子轩',
    views: 431,
    daysAgo: 21,
  },
  {
    kind: 'article',
    id: 'mit-vs-cmu',
    title: 'MIT还是CMU：工科最难做的一道选择题',
    summary: '两个都拿到了。最后我花了一个周末做了决定，没有后悔过。',
    school: 'CMU',
    contentType: '选校建议',
    authorName: '张明远',
    views: 521,
    daysAgo: 6,
  },
  {
    kind: 'article',
    id: 'columbia-core-guide',
    title: '哥大Core Curriculum完全指南：选课、读书、如何不崩溃',
    summary: '大一Lit Hum第一节课，我完全没想到会在课上讨论死亡。大二CC读洛克时，教授把我的问题反问了全班。我花了四年才明白他为什么这么做——不是因为他不知道答案，而是因为那个答案必须自己想出来。这篇文章把我觉得最有用的经验全写出来了。',
    school: 'Columbia',
    contentType: '学术',
    authorName: '刘雨桐',
    views: 312,
    daysAgo: 19,
  },
]

export const essayPosts: EssayPost[] = [
  {
    kind: 'essay',
    id: 'cmu-late-night',
    school: 'CMU',
    contentType: '随笔',
    authorName: '张明远',
    authorYear: '2024届',
    daysAgo: 4,
    views: 178,
    body: '期中考完，在图书馆门口站了五分钟，什么都没想。Pittsburgh十一月的风很冷，但站在那里挺好的。',
    comments: [],
  },
  {
    kind: 'essay',
    id: 'duke-essay-homesick',
    school: 'Duke',
    contentType: '随笔',
    authorName: '李晓彤',
    authorYear: '2023届',
    daysAgo: 5,
    views: 542,
    body: '上周在Bull City Market逛了一下午，找到一家台湾夹饼摊，吃到第一口的时候差点哭出来。不是因为难吃，而是因为——太像北京街边的早餐了。Duke的校园很美，美到有点不真实，林荫大道、哥特式建筑，但有时候走在上面，会突然不知道自己在哪里。\n\n这学期选了五门课，其中有一门是经济系必修的统计入门，原本以为会无聊，没想到教授第一节课就问："你们觉得经济学在研究什么？"没有人回答。他停顿了五秒，然后说，"正确答案是：人。"这句话我到现在还记得。\n\n给还在纠结要不要来文理学院的同学：如果你还没想清楚自己要学什么，来这里。在四中，"不确定"是一种焦虑；在Duke，它是一种可以被认真对待的状态。',
    comments: [
      {
        id: 'c1',
        authorName: '匿名同学',
        authorYear: '高三',
        daysAgo: 4,
        content: '谢谢分享！我也很担心会不适应……Duke的学生竞争氛围重吗？',
      },
      {
        id: 'c2',
        authorName: '李晓彤',
        authorYear: '2023届',
        daysAgo: 4,
        content: '其实比我预想的competitive感弱很多。大家更多是互相帮助——我问过不认识的同学借笔记，从来没被拒绝过。学术上不轻松，但那种压力是自己想做好，不是被人逼着卷。',
        isAmbassador: true,
        ambassadorSchool: 'Duke',
      },
      {
        id: 'c3',
        authorName: '匿名同学',
        authorYear: '高二',
        daysAgo: 3,
        content: 'Duke的Pratt和Trinity申请时需要分开选吗？会影响录取几率吗？',
      },
    ],
  },
  {
    kind: 'essay',
    id: 'nyu-tisch-edit',
    school: 'NYU',
    contentType: '随笔',
    authorName: '赵雨欣',
    authorYear: '2023届',
    daysAgo: 18,
    views: 318,
    body: 'Tisch的剪辑机房在地下室，没有窗户，只有屏幕的蓝光。上周我在那里连续待了十三个小时，剪一部三分钟的短片——关于我在北京最后一个夏天的记忆。\n\n教授看完之后说："你用镜头说了很多，但观众需要呼吸的空间。"我回去又改了两遍，把其中一段留白时间拉长了将近八秒。结果那八秒变成了全片最安静、也最有力量的部分。\n\n如果你想来学电影，准备好放弃"效率"这个概念。在四中时，我以为好作品=投入的时间×技巧。在Tisch，我慢慢明白：好作品更多时候等于——足够诚实，然后愿意推倒重来。',
    comments: [
      {
        id: 'c1',
        authorName: '匿名同学',
        authorYear: '高三',
        daysAgo: 16,
        content: '作品集需要准备多久？我现在高三，感觉来不及了……',
      },
      {
        id: 'c2',
        authorName: '赵雨欣',
        authorYear: '2023届',
        daysAgo: 16,
        content: '高三开始完全来得及！我的作品集是暑假两个月做完的。关键是展示你真正想表达的东西，不要堆数量。三个有想法的作品比十个"完成品"强很多。',
        isAmbassador: true,
        ambassadorSchool: 'NYU',
      },
    ],
  },
]

export const qaPosts: QAPost[] = [
  {
    kind: 'qa',
    id: 'duke-safety-qa',
    school: 'Duke',
    contentType: '公开问答',
    daysAgo: 8,
    views: 267,
    question: 'Duke周边安全吗？',
    questionYear: '高三',
    questionDaysAgo: 9,
    answerAuthorName: '李晓彤',
    answerAuthorYear: '2023届',
    answer: '整体很安全。Durham确实有治安不稳的地方，但Duke主校园（West和East Campus）有专门的校园警察，晚上有免费接送车，宿舍全部刷卡进入。我在这里两年没有遇到过任何安全问题。',
    comments: [],
  },
  {
    kind: 'qa',
    id: 'cmu-essay-qa',
    school: 'CMU',
    contentType: '公开问答',
    daysAgo: 10,
    views: 891,
    question: 'CMU SCS的申请文书到底该写什么方向？我一直以为要强调技术背景，但感觉写出来不够有个人特色。',
    questionYear: '高三',
    questionDaysAgo: 11,
    answerAuthorName: '张明远',
    answerAuthorYear: '2024届',
    answer: '这个问题问得非常准确。技术背景是门槛，不是卖点。招生官看的SCS申请里，99%的人都有竞赛经历、coding项目甚至研究论文。你的技术能力证明你能读这个项目，但不能让你从中脱颖而出。\n\n真正让我文书有所不同的是：我写了一个让我想学CS的瞬间，而不是一段履历。我的主文书从外婆家一本发黄的数学题集开始写，写到高中时参加信息竞赛发现——自己真正热爱的不是"赢"，而是用程序解决真实问题的那种满足感。这条线索很私人，但因此很难被模仿。\n\nSCS的supplement会问你为什么选这个项目，建议认真研究CMU的研究方向，找到至少一个让你真正心动的点——不是因为"好就业"，而是因为"这就是我想做的事"。',
    comments: [
      {
        id: 'c1',
        authorName: '匿名同学',
        authorYear: '高三',
        daysAgo: 9,
        content: '文书字数有要求吗？三篇supplement都需要认真写吗？',
      },
      {
        id: 'c2',
        authorName: '张明远',
        authorYear: '2024届',
        daysAgo: 9,
        content: 'Common App主文书650字上限，我基本写满了。三篇supplement一篇300字、一篇500字、一篇300字，全部都要认真对待——不少招生官说supplement的权重不低于主文书，有时候更高。',
        isAmbassador: true,
        ambassadorSchool: 'CMU',
      },
      {
        id: 'c3',
        authorName: '匿名同学',
        authorYear: '高三',
        daysAgo: 7,
        content: '活动列表如果没有特别突出的竞赛经历怎么办？',
      },
    ],
  },
  {
    kind: 'qa',
    id: 'columbia-core-qa',
    school: 'Columbia',
    contentType: '公开问答',
    daysAgo: 28,
    views: 423,
    question: '哥大Core Curriculum要花多少时间？听说会挤占选专业课的时间，真的值得吗？',
    questionYear: '高二',
    questionDaysAgo: 30,
    answerAuthorName: '刘雨桐',
    answerAuthorYear: '2024届',
    answer: 'Core确实占时间，这一点没有办法美化。大一两学期你会上文学经典（Lit Hum）和艺术史（Art Hum），大二是音乐（Music Hum）和思想史（Contemporary Civilization）。每周的阅读量不小，Lit Hum我读过柏拉图、奥古斯丁、乔叟，还有弗吉尼亚·伍尔夫。\n\n但我想说的是：Core改变了我想问的那种问题。我在社会学里研究城市不平等，以前关注的是政策层面——这个制度有没有效率。读完Core之后，我开始关注：人在这个系统里是什么感觉，这个问题值得被如何表述。这种思维方式的转变，是哥大给我最难替代的东西。\n\n实际来说：如果你非常确定要走纯技术路线，Core会带来一些课程压力。但如果你在四中就对跨领域学习有好奇心，Core会是你在哥大最意外的收获。',
    comments: [
      {
        id: 'c1',
        authorName: '匿名同学',
        authorYear: '高二',
        daysAgo: 26,
        content: 'Core是小班讨论课吗？需要英语特别好才能跟上吗？',
      },
      {
        id: 'c2',
        authorName: '刘雨桐',
        authorYear: '2024届',
        daysAgo: 25,
        content: '对，Core基本都是20人以下的seminar讨论形式。英语要能表达自己的想法，不需要完美——教授很愿意给非母语学生多一点时间。我第一学期发言会紧张，但没有人觉得你说得慢是问题。',
        isAmbassador: true,
        ambassadorSchool: 'Columbia',
      },
    ],
  },
]

export const allFeedItems: FeedItem[] = [
  ...feedPosts,
  ...essayPosts,
  ...qaPosts,
].sort((a, b) => {
  const aPinned = a.kind === 'article' && a.pinned
  const bPinned = b.kind === 'article' && b.pinned
  if (aPinned && !bPinned) return -1
  if (!aPinned && bPinned) return 1
  return a.daysAgo - b.daysAgo
})

export const allSchools: SchoolKey[] = ['CMU', 'Duke', 'Penn', 'Cornell', 'NYU', 'Columbia']

export function getAmbassadorInitials(name: string): string {
  return name.slice(0, 1)
}
