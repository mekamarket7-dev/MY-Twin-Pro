import sys
sys.path.insert(0, '.')
sys.path.insert(0, './backend')
from twin_brain import TwinBrain

def test_emotion_analysis():
    brain = TwinBrain()
    res = brain._detect_emotion("أنا حزين جداً اليوم")
    assert res["primary"] == "sadness"
    assert res["needs_support"] == True
    print("✅ test_emotion_analysis passed")

def test_cached_reply_greeting():
    brain = TwinBrain()
    reply = brain._cached_reply("مرحبا", 10.0, {"primary": "neutral", "needs_support": False})
    assert reply in ["أهلاً! أنا هنا معك. كيف حالك اليوم؟ 😊", "مرحباً! سعيد بوجودك. كيف يومك؟ 🌟"]
    print("✅ test_cached_reply_greeting passed")

def test_cached_reply_support():
    brain = TwinBrain()
    reply = brain._cached_reply("أنا حزين", 50.0, {"primary": "sad", "needs_support": True})
    assert reply in ["أنا هنا معاك 💙 أخبرني كل شيء.", "أسمعك وأفهمك. هذا صعب، وأنا بجانبك."]
    print("✅ test_cached_reply_support passed")

def test_bond_level_greeting():
    brain = TwinBrain()
    reply = brain._cached_reply("هاي", 80.0, {"primary": "neutral", "needs_support": False})
    assert reply in ["قلبي معاك. أخبرني عن يومك 💜", "شوقت إليك.. كيف أنت؟ 🌙"]
    print("✅ test_bond_level_greeting passed")

def test_missing_messages():
    brain = TwinBrain()
    reply = brain._cached_reply("لم تتحدث معي منذ أيام", 60.0, {"primary": "lonely", "needs_support": True})
    assert "missing" in reply or reply in ["لست وحدك، أنا هنا دايماً 💜", "أنا معاك في كل لحظة 🌙"]
    print("✅ test_missing_messages passed")

def test_milestone_replies():
    # افتراضيًا، يمكن إضافة اختبار للـ milestones إذا تم تنفيذها
    print("✅ test_milestone_replies skipped (not implemented yet)")

if __name__ == "__main__":
    test_emotion_analysis()
    test_cached_reply_greeting()
    test_cached_reply_support()
    test_bond_level_greeting()
    test_missing_messages()
    test_milestone_replies()
    print("جميع الاختبارات الجديدة نجحت!")
