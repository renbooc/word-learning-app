import { Word, WordBook } from '@/types';

export const wordBooks: WordBook[] = [
    {
        id: 'book_k9',
        name: '小初阶段核心英语',
        description: '涵盖小学至初中阶段英语课程标准要求的 1600 个核心单词',
        wordCount: 1600,
        category: 'Official',
        isSubscribed: true
    },
    {
        id: 'book_highschool',
        name: '高中核心英语',
        description: '高考必备 3500 词，涵盖高中阶段全部核心词汇与短语',
        wordCount: 3500,
        category: 'Official',
        isSubscribed: false
    },
    {
        id: 'book_cet4',
        name: '大学英语四级 (CET-4)',
        description: '高频核心词汇 2000 词，助力通过考试',
        wordCount: 2000,
        category: 'Official',
        isSubscribed: false
    },
    {
        id: 'book_toefl',
        name: '托福学术词汇 (TOEFL)',
        description: '应对学术场景及高难阅读',
        wordCount: 1500,
        category: 'Official',
        isSubscribed: false
    }
];

export const bookWords: Record<string, any[]> = {
    'book_k9': [
        // 小学部分
        { id: 'p1', word: 'apple', definition: '苹果', pronunciation: '/ˈæpl/', difficulty: 'easy', category: '水果' },
        { id: 'p2', word: 'banana', definition: '香蕉', pronunciation: '/bəˈnænə/', difficulty: 'easy', category: '水果' },
        { id: 'p3', word: 'cat', definition: '猫', pronunciation: '/kæt/', difficulty: 'easy', category: '动物' },
        { id: 'p4', word: 'dog', definition: '狗', pronunciation: '/dɔːɡ/', difficulty: 'easy', category: '动物' },
        { id: 'p5', word: 'egg', definition: '蛋', pronunciation: '/eɡ/', difficulty: 'easy', category: '食物' },
        // 初中部分
        { id: 'm1', word: 'believe', definition: '相信；认为', pronunciation: '/bɪˈliːv/', difficulty: 'medium', category: '动词' },
        { id: 'm2', word: 'challenge', definition: '挑战', pronunciation: '/ˈtʃælɪndʒ/', difficulty: 'medium', category: '动词/名词' },
        { id: 'm3', word: 'develop', definition: '发展；培养', pronunciation: '/dɪˈveləp/', difficulty: 'medium', category: '动词' },
        { id: 'm4', word: 'education', definition: '教育', pronunciation: '/ˌedʒuˈkeɪʃn/', difficulty: 'medium', category: '名词' },
        { id: 'm5', word: 'future', definition: '未来', pronunciation: '/ˈfjuːtʃə(r)/', difficulty: 'medium', category: '名词/形容词' },
    ],
    'book_highschool': [
        { id: 'h1', word: 'abstract', definition: '抽象的；摘要', pronunciation: '/ˈæbstrækt/', difficulty: 'hard', category: '形容词/名词' },
        { id: 'h2', word: 'comprehensive', definition: '全面的；综合的', pronunciation: '/ˌkɒmprɪˈhensɪv/', difficulty: 'hard', category: '形容词' },
        { id: 'h3', word: 'distinguish', definition: '区分；辨别', pronunciation: '/dɪˈstɪŋɡwɪʃ/', difficulty: 'hard', category: '动词' },
        { id: 'h4', word: 'emphasize', definition: '强调；着重', pronunciation: '/ˈemfəsaɪz/', difficulty: 'hard', category: '动词' },
        { id: 'h5', word: 'fundamental', definition: '基本的；根本的', pronunciation: '/ˌfʌndəˈmentl/', difficulty: 'hard', category: '形容词' },
    ],
    'book_cet4': [
        { id: 'c1', word: 'analyze', definition: '分析', pronunciation: '/ˈænəlaɪz/', difficulty: 'medium', category: '动词' },
        { id: 'c2', word: 'benefit', definition: '利益；好处', pronunciation: '/ˈbenɪfɪt/', difficulty: 'medium', category: '动词/名词' },
        { id: 'c3', word: 'constant', definition: '经常的；不变的', pronunciation: '/ˈkɒnstənt/', difficulty: 'medium', category: '形容词' },
        { id: 'c4', word: 'device', definition: '设备；装置', pronunciation: '/dɪˈvaɪs/', difficulty: 'medium', category: '名词' },
        { id: 'c5', word: 'efficient', definition: '效率高的', pronunciation: '/ɪˈfɪʃnt/', difficulty: 'medium', category: '形容词' },
    ],
    'book_toefl': [
        { id: 't1', word: 'aesthetic', definition: '美学的；审美的', pronunciation: '/esˈθetɪk/', difficulty: 'hard', category: '形容词' },
        { id: 't2', word: 'behold', definition: '注视；看见', pronunciation: '/bɪˈhəʊld/', difficulty: 'hard', category: '动词' },
        { id: 't3', word: 'collaborate', definition: '协作', pronunciation: '/kəˈlæbəreɪt/', difficulty: 'hard', category: '动词' },
        { id: 't4', word: 'diminish', definition: '减少；削弱', pronunciation: '/dɪˈmɪnɪʃ/', difficulty: 'hard', category: '动词' },
        { id: 't5', word: 'eloquent', definition: '雄辩的；有说服力的', pronunciation: '/ˈeləkwənt/', difficulty: 'hard', category: '形容词' },
    ]
};

export function getWordsFromBook(bookId: string): Word[] {
    const rawWords = bookWords[bookId] || [];
    return rawWords.map(w => ({
        ...w,
        learned: false,
        mastered: false,
        isFavorite: false,
        srsLevel: 0,
        reviewCount: 0,
        correctCount: 0,
        createdAt: new Date(),
        bookId,
        tags: w.tags || []
    }));
}
