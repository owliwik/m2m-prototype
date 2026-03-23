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

export interface FeedPost {
  id: string
  title: string
  school: SchoolKey
  contentType: ContentType
  authorName: string
  views: number
  daysAgo: number
  pinned?: boolean
}

export const schoolColors: Record<SchoolKey, { bg: string; fg: string }> = {
  CMU:      { bg: '#E8F0FC', fg: '#1F4388' },
  Duke:     { bg: '#E1F0EB', fg: '#0A4A35' },
  Penn:     { bg: '#EEEDFB', fg: '#3C3489' },
  Cornell:  { bg: '#FAF0E0', fg: '#6B3A08' },
  NYU:      { bg: '#FAE8E8', fg: '#7A2020' },
  Columbia: { bg: '#EBF3E0', fg: '#2A5010' },
}

export const contentTypeColors: Record<ContentType, { bg: string; fg: string }> = {
  '文章':    { bg: '#E8F0FC', fg: '#1F4388' },
  '申请文书': { bg: '#E8F0FC', fg: '#1F4388' },
  '问答':    { bg: '#E1F0EB', fg: '#0A4A35' },
  'Tips':   { bg: '#FAF0E0', fg: '#6B3A08' },
  '清单':    { bg: '#EEEDFB', fg: '#3C3489' },
  '推荐':    { bg: '#FAE8E8', fg: '#7A2020' },
  '校园生活': { bg: '#E1F0EB', fg: '#0A4A35' },
  '选校建议': { bg: '#EEEDFB', fg: '#3C3489' },
  '学术':    { bg: '#FAF0E0', fg: '#6B3A08' },
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
    id: 'cmu-essay',
    title: '从四中到CMU SCS：我的文书到底写了什么',
    school: 'CMU',
    contentType: '申请文书',
    authorName: '张明远',
    views: 1200,
    daysAgo: 3,
    pinned: true,
  },
  {
    id: 'duke-first-year',
    title: 'Duke第一年：我最后悔没提前知道的五件事',
    school: 'Duke',
    contentType: '校园生活',
    authorName: '李晓彤',
    views: 876,
    daysAgo: 7,
  },
  {
    id: 'wharton-vs-others',
    title: 'Wharton vs. 其他商科：从四中学生的角度怎么选',
    school: 'Penn',
    contentType: '选校建议',
    authorName: '陈思远',
    views: 654,
    daysAgo: 14,
  },
  {
    id: 'cornell-engineering',
    title: 'Cornell工程的课程压力：真实的一个学期是什么样的',
    school: 'Cornell',
    contentType: '学术',
    authorName: '王子轩',
    views: 431,
    daysAgo: 21,
  },
]

export const allSchools: SchoolKey[] = ['CMU', 'Duke', 'Penn', 'Cornell', 'NYU', 'Columbia']

export function getAmbassadorInitials(name: string): string {
  return name.slice(0, 1)
}
