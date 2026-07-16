/**
 * AutoCorrect AI — Spell Checker Engine
 * Dictionary-based spell checking with Levenshtein distance suggestions
 */

const SpellChecker = (() => {
  // Common English dictionary
  const DICTIONARY = new Set([
    'the','be','to','of','and','a','in','that','have','it','for','not','on','with','he',
    'as','you','do','at','this','but','his','by','from','they','we','say','her','she',
    'or','an','will','my','one','all','would','there','their','what','so','up','out',
    'if','about','who','get','which','go','me','when','make','can','like','time','no',
    'just','him','know','take','people','into','year','your','good','some','could','them',
    'see','other','than','then','now','look','only','come','its','over','think','also',
    'back','after','use','two','how','our','work','first','well','way','even','new','want',
    'because','any','these','give','day','most','us','great','between','need','large','often',
    'hand','high','place','hold','turn','such','here','why','ask','went','men','read','need',
    'land','different','home','move','try','kind','hand','picture','again','change','off',
    'play','spell','air','away','animal','house','point','page','letter','mother','answer',
    'found','still','learn','should','america','world','been','above','called','every','near',
    'add','food','between','own','below','country','plant','last','school','father','keep',
    'tree','never','start','city','earth','eye','light','thought','head','under','story',
    'saw','left','don','few','while','along','might','close','something','seem','next','hard',
    'open','example','begin','life','always','those','both','paper','together','got','group',
    'often','run','important','until','children','side','feet','car','mile','night','walk',
    'white','sea','began','grow','took','river','four','carry','state','once','book','hear',
    'stop','without','second','late','miss','idea','body','music','color','stand','sun','five',
    'question','black','short','numeral','class','wind','rock','space','red','fire','south',
    'piece','told','knew','pass','since','top','whole','king','street','inch','multiply',
    'nothing','course','stay','wheel','full','force','blue','object','decide','surface','deep',
    'moon','island','foot','system','busy','test','record','boat','common','gold','possible',
    'plane','stead','dry','wonder','laugh','thousand','ago','ran','check','game','shape',
    'equate','hot','miss','brought','heat','snow','tire','bring','yes','distant','fill','east',
    'paint','language','among','grand','ball','yet','wave','drop','heart','am','present','heavy',
    'dance','engine','position','arm','wide','sail','material','size','vary','settle','speak',
    'weight','general','ice','matter','circle','pair','include','divide','syllable','felt','perhaps',
    'pick','sudden','count','square','reason','length','represent','art','subject','region','energy',
    'hunt','probable','bed','brother','egg','ride','cell','believe','fraction','forest','sit','race',
    'window','store','summer','train','sleep','prove','lone','leg','exercise','wall','catch','mount',
    'wish','sky','board','joy','winter','sat','written','wild','instrument','kept','glass','grass',
    'cow','job','edge','sign','visit','past','soft','fun','bright','gas','weather','month','million',
    'bear','finish','happy','hope','flower','clothe','strange','gone','jump','baby','eight','village',
    'meet','root','buy','raise','solve','metal','whether','push','seven','paragraph','third','shall',
    'held','hair','describe','cook','floor','either','result','burn','hill','safe','cat','century',
    'consider','type','law','bit','coast','copy','phrase','silent','tall','sand','soil','roll',
    'temperature','finger','industry','value','fight','lie','beat','excite','natural','view','sense',
    'ear','else','quite','broke','case','middle','kill','son','lake','moment','scale','loud','spring',
    'observe','child','straight','consonant','nation','dictionary','milk','speed','method','organ',
    'pay','age','section','dress','cloud','surprise','quiet','stone','tiny','climb','cool','design',
    'poor','lot','experiment','bottom','key','iron','single','stick','flat','twenty','skin','smile',
    'crease','hole','trade','melody','trip','office','receive','row','mouth','exact','symbol','die',
    'least','trouble','shout','except','wrote','seed','tone','join','suggest','clean','break','lady',
    'yard','rise','bad','blow','oil','blood','touch','grew','cent','mix','team','wire','cost','lost',
    'brown','wear','garden','equal','sent','choose','fell','fit','flow','fair','bank','collect','save',
    'control','decimal','gentle','woman','captain','practice','separate','difficult','doctor','please',
    'protect','noon','whose','locate','ring','character','insect','caught','period','indicate','radio',
    'spoke','atom','human','history','effect','electric','expect','crop','modern','element','hit','student',
    'corner','party','supply','bone','rail','imagine','provide','agree','thus','capital','chair','danger',
    'fruit','rich','thick','soldier','process','operate','guess','necessary','sharp','wing','create',
    'neighbor','wash','bat','rather','crowd','corn','compare','poem','string','bell','depend','meat',
    'rub','tube','famous','dollar','stream','fear','sight','thin','triangle','planet','hurry','chief',
    'colony','clock','mine','tie','enter','major','fresh','search','send','yellow','gun','allow','print',
    'dead','spot','desert','suit','current','lift','rose','continue','block','chart','hat','sell','success',
    'company','subtract','event','particular','deal','swim','term','opposite','wife','shoe','shoulder',
    'spread','arrange','camp','invent','cotton','born','determine','quart','nine','truck','noise',
    'level','chance','gather','shop','stretch','throw','shine','property','column','molecule','select',
    'wrong','gray','repeat','require','broad','prepare','salt','nose','plural','anger','claim','continent',
    'oxygen','sugar','death','pretty','skill','women','season','solution','magnet','silver','thank','branch',
    'match','suffix','especially','fig','afraid','huge','sister','steel','discuss','forward','similar',
    'guide','experience','score','apple','bought','led','pitch','coat','mass','card','band','rope','slip',
    'win','dream','evening','condition','feed','tool','total','basic','smell','valley','nor','double',
    'seat','arrive','master','track','parent','shore','division','sheet','substance','favor','connect',
    'post','spend','chord','fat','glad','original','share','station','dad','bread','charge','proper',
    'bar','offer','segment','slave','duck','instant','market','degree','populate','chick','dear','enemy',
    'reply','drink','occur','support','speech','nature','range','steam','motion','path','liquid','log',
    'meant','quotient','teeth','shell','neck','writing','correct','incorrect','grammar','sentence','paragraph',
    'article','preposition','conjunction','pronoun','noun','verb','adjective','adverb','spelling','error',
    'fix','improve','suggest','rewrite','clear','professional','formal','casual','tone','vocabulary',
    'word','phrase','clause','punctuation','comma','period','semicolon','colon','apostrophe','quotation',
    'hyphen','dash','exclamation','question','mark','bracket','parenthesis','ellipsis','slash','asterisk',
    'writing','reading','document','text','content','paragraph','section','chapter','introduction',
    'conclusion','argument','evidence','analysis','summary','description','narration','persuasion',
    'academic','business','creative','technical','scientific','medical','legal','financial','marketing',
    // Additional common words
    'hello','world','please','thank','thanks','welcome','goodbye','sorry','excuse','certainly',
    'absolutely','definitely','probably','possibly','usually','generally','specifically','particularly',
    'especially','recently','currently','previously','eventually','immediately','suddenly','quickly',
    'slowly','carefully','easily','clearly','simply','directly','exactly','approximately','completely',
    'mostly','partly','nearly','almost','enough','quite','rather','very','extremely','incredibly',
    'amazingly','beautiful','wonderful','excellent','amazing','fantastic','incredible','outstanding',
    'impressive','remarkable','significant','important','essential','critical','crucial','necessary',
    'required','optional','available','possible','impossible','difficult','easy','simple','complex',
    'complicated','confusing','obvious','clear','obvious','apparent','evident','certain','uncertain',
    'different','similar','same','equal','opposite','various','several','many','few','some','all',
    'every','each','both','either','neither','another','other','else','only','just','even','still',
    'already','yet','soon','often','sometimes','never','always','usually','rarely','seldom',
    'accurate', 'accurately', 'improve', 'improvements', 'task', 'press', 'pressing'
  ]);

  const CUSTOM_DICTIONARY = new Set();

  // Common misspellings → corrections
  const COMMON_MISSPELLINGS = {
    'teh': 'the', 'hte': 'the', 'adn': 'and', 'nad': 'and', 'taht': 'that',
    'thier': 'their', 'freind': 'friend', 'beleive': 'believe', 'recieve': 'receive',
    'seperate': 'separate', 'occured': 'occurred', 'goverment': 'government',
    'definately': 'definitely', 'calender': 'calendar', 'existance': 'existence',
    'persevere': 'persevere', 'accomodate': 'accommodate', 'occurence': 'occurrence',
    'embarass': 'embarrass', 'necesary': 'necessary', 'noticable': 'noticeable',
    'collegue': 'colleague', 'priviledge': 'privilege', 'concious': 'conscious',
    'wierd': 'weird', 'acheive': 'achieve', 'arguement': 'argument', 'begining': 'beginning',
    'bizzare': 'bizarre', 'buisness': 'business', 'carreer': 'career', 'cemetary': 'cemetery',
    'changable': 'changeable', 'commitee': 'committee', 'consistant': 'consistent',
    'dependant': 'dependent', 'desireable': 'desirable', 'dissapoint': 'disappoint',
    'enviroment': 'environment', 'experianced': 'experienced', 'facination': 'fascination',
    'finaly': 'finally', 'foriegn': 'foreign', 'fourty': 'forty', 'grammer': 'grammar',
    'greatful': 'grateful', 'garantee': 'guarantee', 'happend': 'happened',
    'harrass': 'harass', 'hieght': 'height', 'independant': 'independent',
    'intelligance': 'intelligence', 'intresting': 'interesting', 'knowlege': 'knowledge',
    'liason': 'liaison', 'libary': 'library', 'lisence': 'license', 'maintainance': 'maintenance',
    'mispell': 'misspell', 'misterious': 'mysterious', 'neccessary': 'necessary',
    'neighbor': 'neighbour', 'occassion': 'occasion', 'pasttime': 'pastime',
    'peice': 'piece', 'persistance': 'persistence', 'playwrite': 'playwright',
    'posession': 'possession', 'potatos': 'potatoes', 'presense': 'presence',
    'privelege': 'privilege', 'profesional': 'professional', 'pronounciation': 'pronunciation',
    'publically': 'publicly', 'questionaire': 'questionnaire', 'reccomend': 'recommend',
    'restaraunt': 'restaurant', 'rediculous': 'ridiculous', 'relevent': 'relevant',
    'religous': 'religious', 'remeber': 'remember', 'repitition': 'repetition',
    'responsibilty': 'responsibility', 'restarant': 'restaurant', 'romote': 'remote',
    'sacrefice': 'sacrifice', 'shcool': 'school', 'sieze': 'seize', 'similer': 'similar',
    'speach': 'speech', 'succesful': 'successful', 'surpise': 'surprise',
    'suseptible': 'susceptible', 'therefor': 'therefore', 'threshhold': 'threshold',
    'tounge': 'tongue', 'truely': 'truly', 'twelth': 'twelfth', 'tyrany': 'tyranny',
    'underate': 'underrate', 'unfortunatly': 'unfortunately', 'untill': 'until',
    'usualy': 'usually', 'vaccum': 'vacuum', 'visious': 'vicious', 'visable': 'visible',
    'weried': 'wearied', 'wether': 'whether', 'writen': 'written', 'yatch': 'yacht',
    'youre': "you're", 'its': 'its', 'im': "I'm", 'dont': "don't", 'cant': "can't",
    'wont': "won't", 'isnt': "isn't", 'wasnt': "wasn't", 'didnt': "didn't",
    'hasnt': "hasn't", 'havent': "haven't", 'wouldnt': "wouldn't", 'shouldnt': "shouldn't",
    'couldnt': "couldn't", 'doesnt': "doesn't", 'arent': "aren't", 'werent': "weren't",
    'shoudl': 'should', 'arond': 'around', 'donot': 'do not', 'realy': 'really',
    'definetly': 'definitely', 'becuase': 'because', 'acurate': 'accurate',
    'acurately': 'accurately', 'texet': 'text', 'lookig': 'looking'
  };

  // Levenshtein distance for suggestions
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i-1] === b[j-1]
          ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
    return dp[m][n];
  }

  function getSuggestions(word, maxSuggestions = 5) {
    const w = word.toLowerCase();

    // Direct misspelling lookup
    if (COMMON_MISSPELLINGS[w]) return [COMMON_MISSPELLINGS[w]];

    // Levenshtein-based suggestions
    const candidates = [];
    const maxDist = word.length <= 4 ? 1 : word.length <= 7 ? 2 : 3;

    for (const dictWord of DICTIONARY) {
      if (Math.abs(dictWord.length - w.length) > maxDist) continue;
      const dist = levenshtein(w, dictWord);
      if (dist <= maxDist) candidates.push({ word: dictWord, dist });
    }

    candidates.sort((a, b) => a.dist - b.dist);
    return candidates.slice(0, maxSuggestions).map(c => c.word);
  }

  function checkWordInflections(w) {
    if (DICTIONARY.has(w) || CUSTOM_DICTIONARY.has(w)) return true;

    // Check simple suffix inflections
    // 1. Plural or 3rd person singular verb ending in "s" or "es"
    if (w.endsWith('s')) {
      // e.g. "books" -> "book", "starts" -> "start"
      let stem = w.slice(0, -1);
      if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;

      // e.g. "boxes" -> "box", "goes" -> "go" (ends with "es")
      if (w.endsWith('es')) {
        stem = w.slice(0, -2);
        if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;
      }

      // e.g. "tries" -> "try" (ends with "ies")
      if (w.endsWith('ies')) {
        stem = w.slice(0, -3) + 'y';
        if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;
      }
    }

    // 2. Past tense ending in "ed"
    if (w.endsWith('ed')) {
      // e.g. "started" -> "start", "walked" -> "walk"
      let stem = w.slice(0, -2);
      if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;

      // e.g. "solved" -> "solve" (ends with "d" where base ended in "e")
      stem = w.slice(0, -1);
      if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;

      // e.g. "carried" -> "carry" (ends with "ied" where base ended in "y")
      if (w.endsWith('ied')) {
        stem = w.slice(0, -3) + 'y';
        if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;
      }

      // e.g. "stopped" -> "stop" (double consonant)
      stem = w.slice(0, -2);
      if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
        let singleStem = stem.slice(0, -1);
        if (DICTIONARY.has(singleStem) || CUSTOM_DICTIONARY.has(singleStem)) return true;
      }
    }

    // 3. Progressive tense ending in "ing"
    if (w.endsWith('ing')) {
      // e.g. "starting" -> "start"
      let stem = w.slice(0, -3);
      if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;

      // e.g. "creating" -> "create" (replacing "ing" with "e")
      stem = w.slice(0, -3) + 'e';
      if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;

      // e.g. "running" -> "run" (double consonant before "ing")
      stem = w.slice(0, -3);
      if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
        let singleStem = stem.slice(0, -1);
        if (DICTIONARY.has(singleStem) || CUSTOM_DICTIONARY.has(singleStem)) return true;
      }
    }

    // 4. Adverbs ending in "ly"
    if (w.endsWith('ly')) {
      // e.g. "quickly" -> "quick"
      let stem = w.slice(0, -2);
      if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;

      // e.g. "happily" -> "happy"
      if (w.endsWith('ily')) {
        stem = w.slice(0, -3) + 'y';
        if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;
      }
    }

    return false;
  }

  function isCorrect(word) {
    const w = word.toLowerCase().replace(/[^a-z']/g, '');
    if (!w || w.length <= 1) return true;
    if (checkWordInflections(w)) return true;
    if (/^\d+$/.test(w)) return true; // Numbers
    return false;
  }

  function addToCustomDictionary(word) {
    CUSTOM_DICTIONARY.add(word.toLowerCase());
    const saved = JSON.parse(localStorage.getItem('acai-custom-dict') || '[]');
    saved.push(word.toLowerCase());
    localStorage.setItem('acai-custom-dict', JSON.stringify([...new Set(saved)]));
  }

  function loadCustomDictionary() {
    const saved = JSON.parse(localStorage.getItem('acai-custom-dict') || '[]');
    saved.forEach(w => CUSTOM_DICTIONARY.add(w));
  }

  /**
   * Check text and return array of spell errors
   * @param {string} text
   * @returns {Array<{word, index, suggestions, type}>}
   */
  function check(text) {
    loadCustomDictionary();
    const errors = [];
    // Match words (letters and apostrophes)
    const wordRegex = /\b([a-zA-Z']+)\b/g;
    let match;

    while ((match = wordRegex.exec(text)) !== null) {
      const word = match[1];
      const clean = word.toLowerCase().replace(/'/g, '');
      if (clean.length < 2) continue;

      if (!isCorrect(word)) {
        const suggestions = getSuggestions(word);
        errors.push({
          word,
          index: match.index,
          length: word.length,
          suggestions,
          type: 'spell',
          message: `"${word}" may be misspelled`,
          explanation: suggestions.length > 0
            ? `Did you mean "${suggestions[0]}"?`
            : 'No suggestions found. Add to dictionary if correct.',
        });
      }
    }

    return errors;
  }

  return {
    check,
    isCorrect,
    getSuggestions,
    addToCustomDictionary,
    loadCustomDictionary,
    DICTIONARY,
    COMMON_MISSPELLINGS,
  };
})();

window.SpellChecker = SpellChecker;
