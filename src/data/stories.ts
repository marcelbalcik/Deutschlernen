import type { Story } from "@/types/story";

// 10 "day at kindergarten" stories. Each interleaves narration (read in the
// family language) with Pick and Speak beats that practice a German phrase from
// that moment. Game beats reference phrase ids from phrase_packs.json, so the
// illustrations and audio already exist.

const n = (en: string, tr: string, emoji: string) =>
  ({ type: "narration", text: { en, tr }, emoji }) as const;
const pick = (phraseId: string) =>
  ({ type: "game", phraseId, mode: "pick" }) as const;
const speak = (phraseId: string) =>
  ({ type: "game", phraseId, mode: "speak" }) as const;

export const STORIES: Story[] = [
  {
    id: "first_day",
    emoji: "🎒",
    title: { en: "The First Day", tr: "İlk Gün" },
    steps: [
      n("Today is your first day at kindergarten!", "Bugün kreşteki ilk günün!", "🏫"),
      n("Your teacher waves at the door.", "Öğretmenin kapıda el sallıyor.", "🧑‍🏫"),
      pick("greetings_041"),
      n("A new friend smiles at you.", "Yeni bir arkadaş sana gülümsüyor.", "👧"),
      speak("greetings_001"),
      n("Now wave goodbye to Mom.", "Şimdi anneye el salla.", "👋"),
      speak("greetings_007"),
    ],
  },
  {
    id: "breakfast",
    emoji: "🥣",
    title: { en: "Breakfast", tr: "Kahvaltı" },
    steps: [
      n("Everyone sits down for breakfast.", "Herkes kahvaltı için oturuyor.", "🪑"),
      speak("eating_001"),
      n("You are thirsty too.", "Susadın da.", "🥛"),
      pick("eating_003"),
      n("The food is yummy, but now you are full.", "Yemek lezzetli ama artık doydun.", "🍞"),
      speak("eating_008"),
    ],
  },
  {
    id: "playing",
    emoji: "🧸",
    title: { en: "Playing Together", tr: "Birlikte Oyun" },
    steps: [
      n("Children are playing with blocks.", "Çocuklar bloklarla oynuyor.", "🧒"),
      speak("playing_002"),
      n("Now it is your turn.", "Şimdi sıra sende.", "🔄"),
      pick("playing_003"),
      n("Sharing makes playing more fun.", "Paylaşmak oyunu daha eğlenceli yapar.", "🤝"),
      speak("playing_026"),
    ],
  },
  {
    id: "bathroom",
    emoji: "🚻",
    title: { en: "The Bathroom", tr: "Tuvalet" },
    steps: [
      n("Uh oh, you need the bathroom.", "Eyvah, tuvalete gitmen lazım.", "😬"),
      speak("feelings_body_051"),
      n("But where is it?", "Ama neresi acaba?", "❓"),
      pick("feelings_body_056"),
      n("Ask the teacher for help.", "Öğretmenden yardım iste.", "🧼"),
      speak("feelings_body_052"),
    ],
  },
  {
    id: "unwell",
    emoji: "🤒",
    title: { en: "Feeling Unwell", tr: "Hasta Hissetmek" },
    steps: [
      n("Your tummy hurts.", "Karnın ağrıyor.", "😟"),
      speak("feelings_body_037"),
      n("Tell the teacher you need help.", "Öğretmene yardıma ihtiyacın olduğunu söyle.", "🧑‍🏫"),
      pick("feelings_body_052"),
      n("You miss Mom and want to go home.", "Anneni özledin ve eve gitmek istiyorsun.", "🏠"),
      speak("feelings_body_053"),
    ],
  },
  {
    id: "lunch",
    emoji: "🍝",
    title: { en: "Lunch Time", tr: "Öğle Yemeği" },
    steps: [
      n("It is lunch time.", "Öğle yemeği vakti.", "🍽️"),
      pick("eating_001"),
      n("It is so good — you want a little more.", "Çok güzel — biraz daha istiyorsun.", "🙂"),
      speak("eating_007"),
      n("Say thank you for the food.", "Yemek için teşekkür et.", "🙏"),
      speak("eating_050"),
    ],
  },
  {
    id: "outside",
    emoji: "🌳",
    title: { en: "Playing Outside", tr: "Dışarıda Oyun" },
    steps: [
      n("Time to play outside!", "Dışarıda oynama vakti!", "☀️"),
      speak("playing_001"),
      n("You run with your friends.", "Arkadaşlarınla koşuyorsun.", "🏃"),
      pick("playing_008"),
      n("Be careful near the slide.", "Kaydırağın yanında dikkatli ol.", "⚠️"),
      speak("playing_027"),
    ],
  },
  {
    id: "tidy_up",
    emoji: "🧹",
    title: { en: "Tidy Up", tr: "Toplanma Vakti" },
    steps: [
      n("Playtime is over. Time to clean up.", "Oyun bitti. Toplanma vakti.", "🧸"),
      pick("playing_050"),
      n("That toy is yours — keep it safe.", "O oyuncak senin — onu koru.", "✋"),
      speak("playing_052"),
      n("All done!", "Hepsi bitti!", "✅"),
      speak("eating_051"),
    ],
  },
  {
    id: "new_friends",
    emoji: "🙋",
    title: { en: "New Friends", tr: "Yeni Arkadaşlar" },
    steps: [
      n("You meet a new friend.", "Yeni bir arkadaşla tanışıyorsun.", "👋"),
      speak("greetings_001"),
      n("Ask their name.", "Adını sor.", "❓"),
      pick("greetings_013"),
      n("Nice to meet you!", "Tanıştığımıza memnun oldum!", "😊"),
      speak("greetings_015"),
    ],
  },
  {
    id: "going_home",
    emoji: "🏡",
    title: { en: "Going Home", tr: "Eve Dönüş" },
    steps: [
      n("The day is over and you are tired.", "Gün bitti ve yorgunsun.", "🥱"),
      speak("feelings_body_003"),
      n("Say bye to your friends.", "Arkadaşlarına güle güle de.", "👋"),
      pick("greetings_008"),
      n("See you tomorrow!", "Yarın görüşürüz!", "🌙"),
      speak("greetings_010"),
    ],
  },
];

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}
