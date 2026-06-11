export interface Rank {
  id: number
  title: string
  titleTh: string
  emoji: string
  xpRequired: number
  description: string
  descriptionTh: string
}

export const RANKS: Rank[] = [
  { id: 1, title: 'Intern', titleTh: 'เด็กฝึกงาน', emoji: '🌱', xpRequired: 0, description: 'Just starting the journey', descriptionTh: 'เพิ่งเริ่มเส้นทาง' },
  { id: 2, title: 'Junior Secretary', titleTh: 'เลขามือใหม่', emoji: '📎', xpRequired: 100, description: 'Learning the ropes', descriptionTh: 'กำลังเรียนรู้งาน' },
  { id: 3, title: 'Secretary', titleTh: 'เลขาประจำ', emoji: '📋', xpRequired: 300, description: 'Getting things done', descriptionTh: 'ทำงานได้คล่องแล้ว' },
  { id: 4, title: 'Senior Secretary', titleTh: 'เลขาอาวุโส', emoji: '⭐', xpRequired: 600, description: 'Handling it all with grace', descriptionTh: 'จัดระบบได้หมด' },
  { id: 5, title: 'Executive Secretary', titleTh: 'เลขาผู้บริหาร', emoji: '👑', xpRequired: 1000, description: 'Master of organization', descriptionTh: 'เซียนบริหารเวลา' },
  { id: 6, title: 'Manager', titleTh: 'ผู้จัดการ', emoji: '💼', xpRequired: 1500, description: 'Leading by example', descriptionTh: 'นำด้วยแบบอย่าง' },
  { id: 7, title: 'Director', titleTh: 'ผู้อำนวยการ', emoji: '🏆', xpRequired: 2500, description: 'Strategic excellence', descriptionTh: 'ระดับยุทธศาสตร์' },
  { id: 8, title: 'CEO', titleTh: 'ประธานเจ้าหน้าที่บริหาร', emoji: '🌟', xpRequired: 4000, description: 'Peak productivity master', descriptionTh: 'ยอดคนแห่งประสิทธิภาพ' },
]

export function getRank(xp: number): Rank {
  let current = RANKS[0]
  for (const rank of RANKS) {
    if (xp >= rank.xpRequired) current = rank
  }
  return current
}

export function getNextRank(currentXp: number): Rank | null {
  for (const rank of RANKS) {
    if (rank.xpRequired > currentXp) return rank
  }
  return null
}

export function getRankProgress(xp: number): { currentRank: Rank; nextRank: Rank | null; xpInRank: number; xpToNext: number; progress: number } {
  const currentRank = getRank(xp)
  const nextRank = getNextRank(xp)

  if (!nextRank) {
    return { currentRank, nextRank: null, xpInRank: xp - currentRank.xpRequired, xpToNext: 0, progress: 1 }
  }

  const xpInRank = xp - currentRank.xpRequired
  const xpToNext = nextRank.xpRequired - currentRank.xpRequired
  const progress = Math.min(xpInRank / xpToNext, 1)

  return { currentRank, nextRank, xpInRank, xpToNext, progress }
}

export const XP_SOURCES = {
  HABIT_COMPLETE: 10,
  FOCUS_SESSION: 20,
  TASK_COMPLETE: 15,
  JOURNAL_ENTRY: 5,
  STREAK_BONUS_MULTIPLIER: 2,
} as const

export function calculateStreakBonus(streak: number): number {
  return streak * XP_SOURCES.STREAK_BONUS_MULTIPLIER
}
