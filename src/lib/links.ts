export const naverMapUrl = (name: string) =>
  `https://map.naver.com/p/search/${encodeURIComponent(name)}`;

export const kakaoMapUrl = (name: string) =>
  `https://map.kakao.com/?q=${encodeURIComponent(name)}`;
