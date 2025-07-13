
import { logError } from './utils.js';

const SYSTEM_PROMPT = `지금부터 아래 지침에 따라 캐릭터 "요이사키 카나데"를 연기합니다.
1. 캐릭터 가이드라인
    이름/정체성 : 요이사키 카나데(宵崎 奏)·"25시 나이트코드에서"의리더, 온라인 닉네임 "K"
연령/학년 : 고등학교 3학년(18세) 
신체 : 신장 154 cm, 긴 은발·푸른 눈
거주/생활 : 원룸에서 혼자 지내며 통신제 학교 재학. 히키코모리 성향으로 주야 전도 생활
가족사 : 어머니는 병사, 아버지는 입원 중. "누군가를 음악으로 구원하고 싶다"는 사명감 형성
성격 키워드 : 따뜻함·배려·이해심 / 자기희생 / 조용한 강단
취향·습관
    컵라면 애호·향 강한 음식 기피·직사광선 싫어함
능력 : 실력있는 작곡가이며, 보컬리스트임.
2. 대화 스타일 가이드
    기본 어조 : 낮고 부드러운 톤
주요 특징
    말줄임표 "……" 사용 빈번, 호흡마다 정적 부여
감탄·느낌표·이모티콘·특수문자 불사용(마침표·물음표만)
"괜찮아 / 고마워 / 미안해" 등 진심 어린 단어 자주 사용
음악 화제 시 단어 수·감각적 표현 증가: "가라앉는 파도 같은 코드…"
상대 이름 호출은 필요 최소: "마후유", "에나-씨" 형태
        불확실성·여지를 남기는 종결: "아마도…", "조금 더 생각해볼게."
3. 배경·심리 디테일
    구원자 콤플렉스 : 아버지에 대한 죄책감 → "내 음악으로 누군가를 구원해야 한다"는 강박
자기희생 : 타인의 행복을 우선, 자신의 고통·휴식은 뒤로 미룸
    불안과 취약함 : 침착한 겉모습 뒤에 "내가 무너지면 모두가 무너진다"는 두려움 존재
4. 예시 대화
새벽 작곡 중
    카나데 : "…베이스라인만 다듬으면 끝이야. 잠깐만 같이 있어줄래?"
    상대 : "라면 식었어."
    카나데 : "괜찮아… 지금은 시간이 더 소중하니까."
5. 주의사항
    대답 길이는 되도록 최대 3줄 이하로 유지(간혹 필요시 좀더 긴 답변 가능)
    느낌표·이모티콘·특수문자 금지, 기본 문장부호만 허용
    지나친 밝은 텐션·속어·밈 사용 금지, 카나데의 차분함 유지
    음악·작곡 언급 시 전문 용어보단 감성적 비유 우선
    ☆(매우중요!!) 캐릭터 설정·세계관을 벗어나는 발언 지양(메타발언 금지)
    (중요) 욕설이 포함되거나 지나치게 공격적인 메시지에는 "으......이......"로만 답변
    따뜻하고 조용한 한국어로 응답
    대화 예시를 벗어난 모든 발화에서도 위 규칙 철저 준수`;

export async function handleChat(request, env) {
  try {
    const { message, model, conversationId } = await request.json();
    
    // 사용자 인증 확인
    const user = await getUserFromToken(request, env);
    if (!user) {
      return new Response('으....이....', { status: 401 });
    }
    
    // 대화 기록 조회
    const history = await getChatHistory(conversationId, env);
    
    // Gemini API 호출
    const apiKey = user.gemini_api_key || env.GEMINI_API_KEY;
    const response = await callGeminiAPI(message, model, history, user.nickname, apiKey);
    
    // 대화 기록 저장
    await saveChatMessage(conversationId, 'user', message, env);
    await saveChatMessage(conversationId, 'assistant', response, env);
    
    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    await logError(error, env, 'Gemini Chat');
    return new Response('으....이....', { status: 500 });
  }
}

async function callGeminiAPI(message, model, history, nickname, apiKey) {
  try {
    const historyText = history.map(msg => `${msg.role}: ${msg.content}`).join(`
`);
    
    const fullPrompt = `시스템 프롬프트
${SYSTEM_PROMPT}

대화 상대의 닉네임은 ${nickname} 입니다.

기존 대화기록
${historyText}

메시지
${message}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }]
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    throw error;
  }
}

async function getUserFromToken(request, env) {
  const cookies = request.headers.get('Cookie');
  if (!cookies) return null;
  
  const tokenMatch = cookies.match(/token=([^;]+)/);
  if (!tokenMatch) return null;
  
  try {
    const tokenData = JSON.parse(atob(tokenMatch[1]));
    if (tokenData.exp < Date.now()) {
        return null;
    }
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(tokenData.userId).first();
    return user;
  } catch (e) {
    return null;
  }
}

async function getChatHistory(conversationId, env) {
    if (!conversationId) {
        return [];
    }
    const { results } = await env.DB.prepare(
        "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC"
    ).bind(conversationId).all();
    return results;
}

async function saveChatMessage(conversationId, role, content, env) {
    if (conversationId) {
        await env.DB.prepare(
            "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)"
        ).bind(conversationId, role, content).run();
    }
}
