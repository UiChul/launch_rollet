import type { Menu } from '../types';

const d = (id: string, name: string, emoji: string): Menu => ({
  id: `d-${id}`,
  name,
  emoji,
  isCustom: false,
});

export const DEFAULT_MENUS: Menu[] = [
  // 한식
  d('kimchi-stew', '김치찌개', '🍲'),
  d('doenjang-stew', '된장찌개', '🥘'),
  d('bibimbap', '비빔밥', '🍚'),
  d('bulgogi', '불고기', '🥩'),
  d('samgyeopsal', '삼겹살', '🥓'),
  d('gukbap', '국밥', '🍜'),
  d('naengmyeon', '냉면', '🍜'),
  d('jeyuk', '제육볶음', '🌶️'),
  d('kalguksu', '칼국수', '🍜'),
  d('bossam', '보쌈', '🥬'),
  d('jjimdak', '찜닭', '🍗'),
  d('dakgalbi', '닭갈비', '🍗'),
  // 분식
  d('tteokbokki', '떡볶이', '🌶️'),
  d('gimbap', '김밥', '🍙'),
  d('ramyeon', '라면', '🍜'),
  // 중식
  d('jjajangmyeon', '짜장면', '🍝'),
  d('jjamppong', '짬뽕', '🍜'),
  d('tangsuyuk', '탕수육', '🍖'),
  d('malatang', '마라탕', '🌶️'),
  // 일식
  d('sushi', '초밥', '🍣'),
  d('ramen', '라멘', '🍜'),
  d('donkatsu', '돈가스', '🍱'),
  d('udon', '우동', '🍜'),
  d('gyudon', '규동', '🍚'),
  // 양식
  d('pizza', '피자', '🍕'),
  d('burger', '햄버거', '🍔'),
  d('pasta', '파스타', '🍝'),
  d('steak', '스테이크', '🥩'),
  // 기타
  d('chicken', '치킨', '🍗'),
  d('jokbal', '족발', '🍖'),
  d('pho', '쌀국수', '🍜'),
  d('curry', '카레', '🍛'),
  d('taco', '타코', '🌮'),
  d('salad', '샐러드', '🥗'),
  d('sandwich', '샌드위치', '🥪'),
];
