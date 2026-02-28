const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
// 2.5가 성공하셨다면 유지, 아니면 1.5-flash나 2.0-flash 권장
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export async function analyzeMoodAndCurate(userInput) {
    const prompt = `
당신은 K-POP 큐레이터입니다. 사용자 입력: "${userInput}"
반드시 다음 JSON 형식으로만 응답하세요.

{
  "emotion_summary": "사용자의 현재 기분을 공감해주는 한 줄 요약",
  "emotion_tags": ["감정태그1", "감정태그2", "감정태그3"],
  "playlist": {
    "theme": "이 분위기에 딱 맞는 플레이리스트 제목",
    "description": "이 곡들을 추천하는 이유를 2문장 내외로 짧게 설명",
    "vibe": "분위기 키워드",
    "background_color": "분위기에 어울리는 진한 배경색 Hex 코드 (예: #1a1a2e)",
    "accent_color": "배경과 어울리는 밝은 강조색 Hex 코드 (예: #e94560)",
    "songs": [
      {
        "artist": "가수", 
        "title": "제목", 
        "release_date": "YYYY.MM.DD" // 이 부분을 추가하세요!
      }
    ]
  }
}
* playlist.background_color는 텍스트(흰색)가 잘 보이도록 충분히 어두운 톤으로 지정하세요.
* playlist.accent_color는 테두리나 아이콘에 사용할 밝고 선명한 색으로 지정하세요.
* 곡은 반드시 10곡을 꽉 채워주세요.
* release_date는 해당 곡의 실제 발매일을 "YYYY.MM.DD" 형식으로 정확히 기입하세요.
`;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096, // 1. 토큰 제한을 크게 늘림
                response_mime_type: "application/json"
            }
        })
    });

    if (!response.ok) throw new Error(`API 오류: ${response.status}`);

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 2. 만약 끊긴 텍스트가 들어오면 강제로 괄호를 닫아주는 최소한의 방어 로직 (선택 사항)
    let processedText = rawText.trim();
    if (!processedText.endsWith('}')) {
        console.warn("데이터가 잘린 것 같습니다. 수동 수정을 시도합니다.");
        // 사실 잘린 JSON을 완벽히 복구하는 건 어려우므로,
        // 1번의 maxOutputTokens를 늘리는 게 최선입니다.
    }

    try {
        return JSON.parse(processedText);
    } catch (e) {
        const cleaned = processedText.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    }
}