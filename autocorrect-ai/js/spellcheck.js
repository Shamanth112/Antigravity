/**
 * AutoCorrect AI — Spell Checker Engine v2
 * Massive dictionary + high-confidence autocorrect for near-zero mistakes
 */

const SpellChecker = (() => {

  // ============================================================
  // COMPREHENSIVE ENGLISH DICTIONARY (~3000+ root words)
  // ============================================================
  const DICTIONARY = new Set([
    // Top 300 most common English words
    'the','be','to','of','and','a','in','that','have','i','it','for','not','on','with',
    'he','as','you','do','at','this','but','his','by','from','they','we','say','her','she',
    'or','an','will','my','one','all','would','there','their','what','so','up','out','if',
    'about','who','get','which','go','me','when','make','can','like','time','no','just','him',
    'know','take','people','into','year','your','good','some','could','them','see','other',
    'than','then','now','look','only','come','its','over','think','also','back','after','use',
    'two','how','our','work','first','well','way','even','new','want','because','any','these',
    'give','day','most','us',

    // Common verbs
    'go','come','get','make','take','see','know','think','say','give','find','tell','ask',
    'work','seem','feel','try','leave','call','keep','let','begin','show','hear','play',
    'run','move','live','believe','hold','bring','happen','write','provide','sit','stand',
    'lose','pay','meet','include','continue','set','learn','change','lead','understand',
    'watch','follow','stop','create','speak','read','allow','add','spend','grow','open',
    'walk','win','offer','remember','love','consider','appear','buy','wait','serve','die',
    'send','expect','build','stay','fall','cut','reach','kill','remain','suggest','raise',
    'pass','sell','require','report','decide','pull','develop','eat','break','catch','throw',
    'push','sing','choose','draw','pick','drive','wear','wish','drop','plan','miss','act',
    'reduce','realize','hope','accept','enjoy','teach','receive','agree','step','fight',
    'watch','answer','share','describe','return','close','enter','join','lay','face',
    'leave','reach','start','finish','help','put','end','turn','mean','need','want',

    // Common nouns
    'time','year','people','way','day','man','woman','child','world','life','hand','part',
    'place','case','week','company','system','program','question','work','government','number',
    'night','point','home','water','room','mother','area','money','story','fact','month',
    'lot','right','study','book','eye','job','word','business','issue','side','kind','head',
    'house','service','friend','father','power','hour','game','line','end','member','law',
    'car','city','community','name','president','team','minute','idea','kid','body','information',
    'back','parent','face','others','level','office','door','health','person','art','war',
    'history','party','result','change','morning','reason','research','girl','guy','moment',
    'air','teacher','force','education','foot','boy','age','policy','process','music','market',
    'sense','product','effect','class','control','rate','value','action','attention','role',
    'field','matter','figure','type','model','risk','character','deal','choice','property',
    'student','society','activity','language','theory','plan','development','interest','test',
    'practice','country','family','group','order','situation','picture','letter','paper','table',
    'color','fire','ground','base','form','stage','project','energy','animal','road','earth',
    'plant','food','school','tree','garden','star','sun','moon','rock','sky','weather','rain',
    'snow','ice','river','ocean','sea','lake','mountain','hill','island','forest','beach',
    'land','ground','soil','sand','stone','metal','wood','glass','plastic','gold','silver',
    'iron','steel','water','oil','gas','light','sound','heat','cold','wind',

    // Common adjectives
    'good','new','first','last','long','great','little','own','other','old','right','big',
    'high','different','small','large','next','early','young','important','few','public',
    'bad','same','able','free','sure','true','real','full','hot','cold','hard','soft',
    'fast','slow','strong','weak','clean','dirty','bright','dark','deep','wide','narrow',
    'thick','thin','flat','sharp','smooth','rough','heavy','light','dry','wet','fresh','warm',
    'cool','loud','quiet','rich','poor','safe','dangerous','beautiful','ugly','happy','sad',
    'angry','afraid','brave','calm','busy','empty','famous','healthy','hungry','tired','sick',
    'alive','dead','easy','difficult','simple','complex','clear','obvious','certain','possible',
    'impossible','necessary','available','recent','specific','general','popular','common',
    'rare','strange','normal','natural','serious','creative','critical','basic','entire',
    'perfect','special','original','unique','fine','nice','pretty','terrible','awful',
    'amazing','wonderful','excellent','fantastic','incredible','remarkable','impressive',
    'outstanding','significant','essential','crucial','vital','urgent','correct','wrong',
    'accurate','exact','proper','appropriate','suitable','relevant','interesting','boring',
    'exciting','surprising','confusing','obvious','apparent','evident','comfortable',

    // Common adverbs
    'not','also','very','often','however','too','usually','really','already','always',
    'sometimes','never','still','again','actually','probably','definitely','possibly',
    'certainly','absolutely','obviously','clearly','simply','directly','exactly','nearly',
    'almost','enough','quite','rather','extremely','incredibly','completely','totally',
    'entirely','mostly','partly','slightly','gradually','eventually','immediately','suddenly',
    'quickly','slowly','carefully','easily','recently','currently','previously','finally',
    'generally','specifically','particularly','especially','basically','honestly','seriously',

    // Pronouns & determiners
    'i','me','my','mine','myself','you','your','yours','yourself','he','him','his','himself',
    'she','her','hers','herself','it','its','itself','we','our','ours','ourselves',
    'they','them','their','theirs','themselves','this','that','these','those',
    'who','whom','whose','which','what','where','when','why','how',
    'each','every','both','all','some','any','no','none','few','many','much','more','most',
    'several','another','other','either','neither',

    // Prepositions & conjunctions
    'about','above','across','after','against','along','among','around','at','before',
    'behind','below','beneath','beside','between','beyond','by','down','during','except',
    'for','from','in','inside','into','near','of','off','on','onto','out','outside','over',
    'past','since','through','throughout','to','toward','towards','under','underneath',
    'until','up','upon','with','within','without',
    'and','but','or','nor','so','yet','because','although','though','while','if','unless',
    'since','before','after','until','when','whenever','where','wherever',

    // Numbers
    'zero','one','two','three','four','five','six','seven','eight','nine','ten',
    'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen',
    'twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety','hundred',
    'thousand','million','billion','first','second','third','fourth','fifth',

    // Days, months, time
    'monday','tuesday','wednesday','thursday','friday','saturday','sunday',
    'january','february','march','april','may','june','july','august','september',
    'october','november','december',
    'today','tomorrow','yesterday','tonight','morning','afternoon','evening','noon',

    // Common proper nouns (lowercased for matching)
    'america','american','english','british','european','african','asian','indian',
    'chinese','japanese','french','german','spanish','italian','russian','canadian',
    'australian','london','paris','tokyo','york',

    // Technology & modern vocabulary
    'computer','software','hardware','internet','website','online','offline','digital',
    'technology','data','database','server','client','network','browser','email','password',
    'username','account','profile','login','logout','signup','download','upload','file',
    'folder','app','application','mobile','phone','tablet','desktop','laptop','screen',
    'keyboard','mouse','click','search','google','facebook','twitter','instagram','youtube',
    'video','audio','photo','image','camera','media','blog','post','comment','message',
    'chat','text','link','url','page','site','code','coding','programming','developer',
    'design','designer','layout','template','button','icon','menu','panel','dashboard',
    'setting','settings','feature','option','tool','update','version','install','delete',
    'remove','edit','save','copy','paste','undo','redo','format','font','size','color',

    // Business & professional
    'meeting','project','deadline','budget','report','presentation','schedule','client',
    'customer','employee','manager','director','executive','department','organization',
    'strategy','goal','target','performance','revenue','profit','investment','contract',
    'proposal','negotiation','collaboration','partnership','opportunity','challenge',
    'solution','innovation','productivity','efficiency','quality','feedback','review',

    // Education
    'university','college','school','student','teacher','professor','lecture','course',
    'class','lesson','homework','assignment','exam','test','grade','degree','diploma',
    'research','thesis','essay','paper','study','library','laboratory','experiment',
    'knowledge','education','learning','training','skill','ability','talent','intelligence',

    // Health & body
    'health','healthy','hospital','doctor','nurse','patient','medicine','treatment',
    'surgery','disease','illness','symptom','pain','blood','bone','muscle','brain',
    'heart','lung','stomach','skin','tooth','teeth','arm','leg','hand','foot','finger',
    'eye','ear','nose','mouth','face','head','neck','shoulder','back','chest','knee',

    // Food & drink
    'food','water','coffee','tea','juice','milk','bread','rice','meat','chicken','fish',
    'egg','cheese','butter','sugar','salt','pepper','fruit','vegetable','apple','orange',
    'banana','tomato','potato','salad','soup','pizza','pasta','sandwich','cake','chocolate',
    'cookie','breakfast','lunch','dinner','meal','restaurant','kitchen','cook','recipe',

    // Home & family
    'home','house','apartment','room','bedroom','bathroom','kitchen','door','window','wall',
    'floor','ceiling','roof','stairs','furniture','table','chair','bed','desk','sofa',
    'family','father','mother','brother','sister','son','daughter','husband','wife',
    'grandparent','grandfather','grandmother','uncle','aunt','cousin','baby','child','children',
    'friend','neighbor','relationship','marriage','wedding','birthday','holiday','vacation',

    // Nature & environment
    'nature','environment','climate','pollution','carbon','renewable','sustainable',
    'wildlife','species','habitat','ecosystem','conservation','recycling','energy',
    'electricity','solar','nuclear','temperature','pressure','atmosphere',

    // Emotions & abstract
    'love','hate','fear','anger','joy','happiness','sadness','surprise','hope','trust',
    'respect','courage','patience','freedom','justice','peace','truth','beauty','success',
    'failure','effort','progress','growth','opinion','belief','idea','thought','memory',
    'dream','imagination','reality','experience','adventure','journey','future','past',

    // Clothing & materials
    'clothes','shirt','pants','dress','shoes','hat','coat','jacket','suit','tie',
    'fabric','cotton','silk','wool','leather','rubber','paper','cardboard',

    // Transportation
    'car','bus','train','plane','ship','boat','bicycle','motorcycle','truck','taxi',
    'airport','station','road','street','highway','bridge','traffic','parking','drive',
    'ride','travel','trip','flight','ticket','passenger',

    // Sports & entertainment
    'sport','game','play','player','team','match','score','win','lose','competition',
    'champion','trophy','ball','goal','field','court','stadium','exercise','fitness',
    'running','swimming','football','basketball','baseball','soccer','tennis','golf',
    'movie','film','show','series','episode','actor','actress','director','theater','concert',

    // Grammar & writing related
    'grammar','spelling','punctuation','sentence','paragraph','word','phrase','clause',
    'noun','verb','adjective','adverb','pronoun','preposition','conjunction','article',
    'comma','period','semicolon','colon','apostrophe','quotation','hyphen','dash',
    'exclamation','question','mark','bracket','parenthesis','ellipsis','slash','asterisk',
    'writing','reading','document','content','chapter','introduction','conclusion',
    'argument','evidence','analysis','summary','description','narration','persuasion',
    'formal','informal','casual','professional','academic','creative','technical',
    'vocabulary','definition','meaning','synonym','antonym','context','tone','style',

    // Additional high-frequency words
    'thing','things','something','anything','nothing','everything','someone','anyone',
    'everyone','nobody','somewhere','anywhere','everywhere','nowhere','lot','lots',
    'kind','sort','type','stuff','bit','piece','part','half','rest','whole','set',
    'group','number','amount','total','average','rate','percentage','majority','minority',
    'example','fact','detail','feature','aspect','element','factor','issue','problem',
    'trouble','matter','concern','situation','condition','circumstance','position',
    'point','purpose','reason','cause','effect','result','outcome','consequence',
    'advantage','disadvantage','benefit','cost','price','value','worth','quality',
    'standard','level','degree','extent','range','limit','minimum','maximum',
    'increase','decrease','rise','fall','growth','decline','improvement','reduction',
    'beginning','middle','end','start','finish','opening','closing','introduction',
    'conclusion','step','stage','phase','process','method','approach','technique',
    'strategy','system','structure','framework','pattern','model','theory','concept',
    'principle','rule','law','regulation','policy','guideline','requirement','standard',
    'measure','assessment','evaluation','judgment','decision','option','alternative',
    'answer','response','reply','reaction','solution','suggestion','recommendation',
    'advice','information','data','evidence','proof','support','argument','claim',

    // More verbs people commonly type
    'access','achieve','acquire','adapt','address','adjust','admit','adopt','advance',
    'advertise','advise','afford','announce','anticipate','apologize','apply','appreciate',
    'approve','argue','arrange','arrive','assess','assign','assist','associate','assume',
    'assure','attach','attempt','attend','attract','avoid','base','bear','beat','become',
    'belong','blame','block','borrow','bother','calculate','cancel','capture','celebrate',
    'challenge','combine','commit','communicate','compare','compete','complain','complete',
    'concentrate','confirm','connect','construct','consult','contain','contribute','convert',
    'convince','cooperate','correct','count','cover','crash','cross','damage','deal',
    'debate','declare','decline','defeat','defend','define','deliver','demand','demonstrate',
    'deny','depend','deposit','derive','deserve','destroy','detect','determine','differ',
    'disagree','disappear','discover','display','distinguish','distribute','disturb','divide',
    'doubt','earn','educate','eliminate','emerge','emphasize','employ','enable','encounter',
    'encourage','engage','enhance','ensure','equip','escape','establish','estimate','evaluate',
    'examine','exceed','exchange','exclude','execute','exist','expand','experience','experiment',
    'explain','explore','expose','express','extend','fail','favor','fix','focus','generate',
    'grab','guarantee','handle','identify','ignore','illustrate','imply','impose','impress',
    'improve','indicate','influence','inform','inspire','integrate','intend','interpret',
    'introduce','investigate','invest','involve','isolate','justify','launch','limit',
    'link','maintain','manage','manufacture','mark','measure','mention','monitor','motivate',
    'negotiate','note','notice','obtain','occur','operate','oppose','organize','overcome',
    'participate','perceive','perform','permit','persuade','possess','predict','prefer',
    'prepare','present','preserve','prevent','print','produce','promote','propose','protect',
    'protest','prove','publish','purchase','pursue','qualify','quote','react','recognize',
    'recommend','recover','reflect','refuse','regard','register','reject','relate','release',
    'rely','remind','remove','replace','represent','reproduce','request','resolve','respond',
    'restore','restrict','retain','reveal','satisfy','secure','seek','shift','signal',
    'specify','sponsor','strengthen','submit','succeed','suffer','supply','survive','suspect',
    'sustain','switch','tend','threaten','trace','transfer','transform','translate','treat',
    'trigger','undergo','undertake','urge','utilize','vary','verify','wander','warn','wonder',

    // More adjectives
    'acceptable','accessible','active','actual','additional','adequate','alternative',
    'annual','appropriate','automatic','capable','central','comfortable','commercial',
    'competitive','comprehensive','confident','conscious','considerable','consistent',
    'constant','contemporary','conventional','cultural','curious','current','desperate',
    'detailed','domestic','dominant','dramatic','eastern','economic','effective','efficient',
    'electronic','emotional','enormous','environmental','equivalent','ethnic','everyday',
    'evil','excessive','existing','expensive','external','extra','extreme','familiar',
    'federal','financial','foreign','formal','former','frequent','fundamental','genuine',
    'global','grateful','guilty','historical','horrible','hostile','ideal','illegal',
    'immediate','individual','industrial','inevitable','informal','initial','inner',
    'innocent','intellectual','internal','international','legitimate','liberal','logical',
    'lonely','lucky','massive','maximum','mental','military','minimum','minor','moral',
    'mysterious','negative','neutral','objective','obvious','official','opposite','ordinary',
    'organic','overall','painful','passive','permanent','personal','physical','pleasant',
    'political','positive','potential','powerful','practical','precise','previous','primary',
    'principal','prior','private','professional','prominent','psychological','radical',
    'random','rapid','rational','reasonable','regular','relative','remarkable','remote',
    'representative','residential','responsible','romantic','royal','rural','scientific',
    'secondary','secure','sensitive','severe','sexual','slight','smooth','social',
    'southern','spiritual','standard','statistical','strict','substantial','successful',
    'sufficient','technical','temporary','theoretical','traditional','typical','ugly',
    'unable','unfair','unfortunate','unlikely','unnecessary','unusual','upper','urban',
    'useful','valuable','various','vast','violent','virtual','visible','visual','vital',
    'vulnerable','western','willing','wooden','worthy',

    // More nouns
    'accident','achievement','administration','advertising','agreement','agriculture',
    'aircraft','alliance','alternative','analysis','anxiety','apartment','appearance',
    'argument','arrangement','assault','assembly','assessment','atmosphere','authority',
    'awareness','background','balance','barrier','battle','behavior','boundary','cabinet',
    'campaign','candidate','capacity','category','celebration','ceremony','chairman',
    'championship','chapter','coalition','colleague','collection','combination','comfort',
    'commander','commission','commitment','communication','comparison','compensation',
    'complaint','component','composition','concentration','conclusion','conference',
    'confidence','conflict','confusion','connection','consciousness','consensus',
    'conservation','consideration','conspiracy','construction','consultant','consumer',
    'consumption','contribution','controversy','conversation','conviction','cooperation',
    'corporation','correspondent','coverage','creature','criticism','currency','curriculum',
    'database','declaration','demonstration','depression','description','destination',
    'destruction','dimension','direction','disability','discipline','discrimination',
    'discussion','distinction','distribution','diversity','documentary','donation',
    'economy','edition','editor','effectiveness','efficiency','election','emergency',
    'emission','emotion','emphasis','employment','engineering','entertainment','enthusiasm',
    'entry','equipment','establishment','evaluation','evolution','examination','exception',
    'existence','expansion','expectation','expedition','expense','expertise','explanation',
    'expression','extension','facility','fashion','federation','fiction','foundation',
    'frequency','frustration','function','generation','governor','guidance','headline',
    'headquarters','historian','household','identification','identity','imagination',
    'immigration','implementation','implication','impression','improvement','incident',
    'independence','indication','infection','inflation','ingredient','initiative',
    'injury','inspiration','institution','instruction','instrument','insurance',
    'intention','interaction','investigation','investor','judgment','landscape',
    'leadership','legislation','lifestyle','limitation','literature','location',
    'manufacture','manufacturer','mechanism','membership','minister','minority',
    'mixture','modification','motivation','movement','narrative','navigation',
    'obligation','observation','occupation','offense','operation','opponent',
    'opposition','organism','orientation','outcome','output','ownership','participant',
    'partnership','perception','perspective','philosophy','photograph','politician',
    'popularity','population','possession','possibility','poverty','prediction',
    'preparation','prescription','priority','privacy','probability','procedure',
    'profession','proportion','prosecution','prosperity','publication','punishment',
    'recommendation','reduction','reflection','registration','regulation','rejection',
    'representation','reputation','requirement','resignation','resolution','resource',
    'restriction','retirement','revolution','satisfaction','scenario','scholarship',
    'selection','settlement','significance','simulation','specialist','specification',
    'structure','substance','suggestion','supplement','supporter','suspension',
    'symptom','technique','tendency','territory','transition','transmission',
    'transportation','uncertainty','understanding','variation','version','volunteer',
    'weakness','wealth',

    // Tech & web vocabulary
    'blog','blogs','blogger','blogging','title','titles','heading','headings',
    'subheading','app','apps','user','users','profile','profiles',
    'inbox','messaging','chatting','comment','comments','commenting',
    'webpage','webpages','linking','layout','layouts','designing',
    'preference','preferences','dataset','directory','directories',
    'coder','script','scripts','programmer','device','devices',
    'download','downloads','upload','uploads',
    'navbar','sidebar','topbar','modal','modals',
    'checkbox','toggle','slider','analytics','metric','metrics',
    'session','sessions','token','auth','api',

    // Common words that were causing false corrections
    'around','really','friend','friends','because','through','thought','although',
    'enough','brought','caught','taught','bought','fought','sought','ought',
    'since','before','after','during','while','where','there','here','every',
    'never','always','sometimes','often','usually','already','still','yet',
    'together','apart','away','between','among','along','across','behind',
    'below','above','inside','outside','without','within','against','toward',
    'whatever','whenever','wherever','whoever','however','moreover','furthermore',
    'therefore','otherwise','meanwhile','nevertheless','nonetheless','regardless',
    'according','concerning','considering','following','including','regarding',
    'basically','honestly','seriously','literally','definitely','absolutely',
    'obviously','apparently','unfortunately','surprisingly','interesting',
    'importantly','significantly','approximately','particularly','specifically',
    'unfortunately','immediately','automatically','independently','successfully',
    'professional','professionals','professional','professionally',
    'responsibility','responsibilities','communication','communications',
    'understanding','understandable','consideration','recommendation',
    'environmental','international','organizational','representative',
    'government','governments','development','developments','management',
    'relationship','relationships','information','technology','technologies',
    'opportunity','opportunities','experience','experiences','important',
    'different','something','everything','nothing','anything','everyone',
    'someone','anyone','becoming','beginning','believing','building',
    'coming','doing','going','having','keeping','knowing','living',
    'looking','making','moving','playing','putting','running','saying',
    'seeing','taking','telling','thinking','trying','turning','using',
    'wanting','working','getting','giving','finding','feeling','leaving',
    'calling','starting','stopping','opening','closing','writing',
    'reading','speaking','listening','watching','waiting','sitting',
    'standing','walking','talking','eating','sleeping','driving',
    'flying','swimming','dancing','singing','teaching','learning',
    'helping','asking','answering','changing','growing','showing',
    'spending','building','creating','providing','developing',
    'working','possible','probably','necessary','actually','certainly',
    'especially','extremely','generally','naturally','recently',
    'simply','truly','usually','about','above','across','after'
  ]);

  const CUSTOM_DICTIONARY = new Set();

  // ============================================================
  // MASSIVE MISSPELLING MAP (300+ entries)
  // ============================================================
  const COMMON_MISSPELLINGS = {
    // Very common typos
    'teh':'the','hte':'the','adn':'and','nad':'and','taht':'that','thta':'that',
    'thn':'then','hav':'have','hvae':'have','fro':'for','fpr':'for','nto':'not',
    'nit':'not','wiht':'with','wtih':'with','wih':'with','frmo':'from','fom':'from',
    'thye':'they','tehy':'they','whe':'when','whne':'when','whic':'which',
    'wich':'which','woud':'would','wuold':'would','thier':'their','ther':'there',
    'abot':'about','abut':'about','jsut':'just','juts':'just','knwo':'know',
    'konw':'know','tiem':'time','tme':'time','liek':'like','lke':'like',
    'cna':'can','coud':'could','shold':'should','shoud':'should','shoudl':'should',

    // Common letter swap typos
    'becuase':'because','becasue':'because','beacuse':'because','becouse':'because',
    'becaues':'because','becaus':'because','becase':'because',
    'beleive':'believe','belive':'believe','beleave':'believe',
    'recieve':'receive','receve':'receive','receiv':'receive',
    'freind':'friend','frend':'friend','firend':'friend',
    'peolpe':'people','poeple':'people','pepole':'people','peopel':'people',
    'diffrent':'different','differnt':'different','diferent':'different','differet':'different',
    'goverment':'government','govenment':'government','govermnent':'government',
    'enviroment':'environment','enviorment':'environment','enviornment':'environment',

    // Double/missing letter errors
    'writting':'writing','writng':'writing','wrting':'writing',
    'occured':'occurred','occuring':'occurring','occurence':'occurrence','occurrance':'occurrence',
    'accomodate':'accommodate','acommodate':'accommodate',
    'embarass':'embarrass','embarras':'embarrass','embarrased':'embarrassed',
    'neccessary':'necessary','necesary':'necessary','neccesary':'necessary','necessery':'necessary',
    'succesful':'successful','successfull':'successful','succesfull':'successful',
    'profesional':'professional','proffesional':'professional','proffessional':'professional',
    'commitee':'committee','comittee':'committee','committe':'committee',
    'dissapoint':'disappoint','disapoint':'disappoint','dissappoint':'disappoint',
    'recomend':'recommend','reccommend':'recommend','reccomend':'recommend',
    'begining':'beginning','begginning':'beginning','beggining':'beginning',
    'misspell':'misspell','mispell':'misspell','mispel':'misspell',

    // -tion/-sion endings
    'definately':'definitely','definatly':'definitely','definetly':'definitely','definetely':'definitely',
    'seperate':'separate','seperately':'separately','separatly':'separately',
    'independant':'independent','independance':'independence',
    'dependant':'dependent','dependance':'dependence',
    'existance':'existence','existense':'existence',
    'persistance':'persistence','persistanse':'persistence',
    'maintainance':'maintenance','maintenace':'maintenance',
    'responsibilty':'responsibility','responsability':'responsibility',
    'pronounciation':'pronunciation','prononciation':'pronunciation',
    'repitition':'repetition','reptition':'repetition',

    // -able/-ible endings
    'changable':'changeable','managable':'manageable',
    'noticable':'noticeable','servicable':'serviceable',
    'desireable':'desirable','valueable':'valuable',
    'visable':'visible','flexable':'flexible',
    'accessable':'accessible','permissable':'permissible',

    // -ful/-fully endings
    'helpfull':'helpful','usefull':'useful','beautifull':'beautiful',
    'wonderfull':'wonderful','succesfull':'successful','gratefull':'grateful',
    'powerfull':'powerful','carefull':'careful','painfull':'painful',
    'peacefull':'peaceful','plentifull':'plentiful','faithfull':'faithful',

    // -ence/-ance endings
    'occurrance':'occurrence','refference':'reference',
    'prefference':'preference','differance':'difference',
    'conferance':'conference','intellegence':'intelligence',
    'intelligance':'intelligence','experiense':'experience',

    // ie/ei confusion
    'acheive':'achieve','acheived':'achieved','acheiving':'achieving',
    'beleif':'belief','cheif':'chief','yeild':'yield',
    'foriegn':'foreign','wierd':'weird','seize':'seize',
    'peice':'piece','concieve':'conceive','decieve':'deceive',
    'percieve':'perceive',

    // Other common misspellings
    'calender':'calendar','calandar':'calendar',
    'grammer':'grammar','gramer':'grammar',
    'greatful':'grateful','gratefull':'grateful',
    'garantee':'guarantee','guarentee':'guarantee','garauntee':'guarantee',
    'happend':'happened','hapened':'happened',
    'harrass':'harass','harras':'harass',
    'hieght':'height','heigth':'height',
    'intresting':'interesting','intersting':'interesting','intresing':'interesting',
    'knowlege':'knowledge','knowlede':'knowledge',
    'liason':'liaison','liasion':'liaison',
    'libary':'library','liberry':'library',
    'lisence':'license','lisense':'license','licence':'license',
    'occassion':'occasion','ocassion':'occasion',
    'posession':'possession','possesion':'possession',
    'priviledge':'privilege','privelege':'privilege',
    'questionaire':'questionnaire','questionare':'questionnaire',
    'restaraunt':'restaurant','restarant':'restaurant','resturant':'restaurant',
    'rediculous':'ridiculous','rediculus':'ridiculous',
    'relevent':'relevant','relavent':'relevant',
    'religous':'religious','religius':'religious',
    'remeber':'remember','remmber':'remember','rember':'remember',
    'sacrefice':'sacrifice','sacrifise':'sacrifice',
    'similer':'similar','similiar':'similar','simlar':'similar',
    'speach':'speech','speach':'speech',
    'surpise':'surprise','suprise':'surprise','surprize':'surprise',
    'therefor':'therefore','therfore':'therefore',
    'threshhold':'threshold','thresold':'threshold',
    'tounge':'tongue','tounge':'tongue',
    'truely':'truly','truley':'truly',
    'unfortunatly':'unfortunately','unfortunatley':'unfortunately',
    'untill':'until','untl':'until',
    'usualy':'usually','usally':'usually','ussually':'usually',
    'vaccum':'vacuum','vaccuum':'vacuum','vacum':'vacuum',
    'wether':'whether','whethr':'whether',
    'writen':'written','writtin':'written',

    // Contractions (missing apostrophe)
    'youre':"you're",'theyre':"they're",'theyve':"they've",
    'weve':"we've",'ive':"I've",'youve':"you've",
    'im':"I'm",'dont':"don't",'cant':"can't",'wont':"won't",
    'isnt':"isn't",'wasnt':"wasn't",'didnt':"didn't",
    'hasnt':"hasn't",'havent':"haven't",'wouldnt':"wouldn't",
    'shouldnt':"shouldn't",'couldnt':"couldn't",'doesnt':"doesn't",
    'arent':"aren't",'werent':"weren't",'lets':"let's",
    'thats':"that's",'whats':"what's",'whos':"who's",
    'heres':"here's",'theres':"there's",'wheres':"where's",

    // Fast-typing errors (adjacent key swaps)
    'tge':'the','yhe':'the','rhe':'the','thr':'the',
    'abd':'and','anf':'and','ans':'and',
    'fir':'for','foe':'for','gor':'for',
    'yoi':'you','yoy':'you','tou':'you',
    'nit':'not','noy':'not',
    'woth':'with','wirh':'with','eith':'with',
    'helo':'hello','helllo':'hello',
    'realy':'really','relly':'really','reallt':'really',
    'arond':'around','aroud':'around',
    'somthing':'something','somethign':'something','smething':'something',
    'imporant':'important','importent':'important','importnt':'important',
    'diffrent':'different','difrent':'different',
    'probaly':'probably','probbaly':'probably','probablt':'probably',
    'actualy':'actually','actualyl':'actually','actaully':'actually',
    'certanly':'certainly','certianly':'certainly',
    'finaly':'finally','fianlly':'finally',
    'definetly':'definitely','defintely':'definitely',
    'especilly':'especially','espcially':'especially',
    'immediatly':'immediately','immediatley':'immediately',
    'necesarily':'necessarily','necessarilly':'necessarily',

    // Extra common ones users type wrong
    'acurate':'accurate','acurately':'accurately',
    'texet':'text','lookig':'looking',
    'speling':'spelling','spellng':'spelling',
    'wurd':'word','wurds':'words',
    'proccess':'process','proess':'process',
    'systeme':'system','ssytem':'system',
    'servise':'service','sevice':'service',
    'nothingg':'nothing',
    'peopl':'people',
    'thnak':'thank','thnaks':'thanks',
    'welcom':'welcome','wellcome':'welcome',
    'donot':'do not',
    'alot':'a lot','alright':'all right',
    'toghether':'together','togther':'together',
    'tommorow':'tomorrow','tomorow':'tomorrow','tommorrow':'tomorrow',
    'bizzare':'bizarre','bizare':'bizarre',
    'buisness':'business','bussiness':'business','busines':'business',
    'carreer':'career','carrer':'career',
    'cemetary':'cemetery','cematery':'cemetery',
    'consistant':'consistent','consistnet':'consistent',
    'experianced':'experienced','experiensed':'experienced',
    'facination':'fascination','fasination':'fascination',
    'fourty':'forty',
    'goverment':'government','govermnent':'government',
    'shcool':'school','scool':'school','schol':'school',
    'visious':'vicious',
    'yatch':'yacht',
    'reciept':'receipt','recipt':'receipt',
    'adress':'address','addres':'address',
    'agressive':'aggressive','agresive':'aggressive',
    'amatuer':'amateur','amature':'amateur',
    'apparant':'apparent','aparent':'apparent',
    'arguement':'argument','arguemnt':'argument',
    'catagory':'category','categorie':'category',
    'colum':'column','collumn':'column',
    'concensus':'consensus','concencus':'consensus',
    'dilema':'dilemma','dilemna':'dilemma',
    'excercise':'exercise','exersise':'exercise','exercize':'exercise',
    'explaination':'explanation',
    'familar':'familiar','familliar':'familiar',
    'geneology':'genealogy',
    'guage':'gauge','gage':'gauge',
    'humourous':'humorous','humoros':'humorous',
    'immitate':'imitate','imitate':'imitate',
    'innoculate':'inoculate',
    'minature':'miniature','miniture':'miniature',
    'mischievious':'mischievous','mischevious':'mischievous',
    'paralel':'parallel','parrallel':'parallel','parralel':'parallel',
    'parliment':'parliament','parliment':'parliament',
    'perseverence':'perseverance','perseveranse':'perseverance',
    'publically':'publicly',
    'refered':'referred','reffered':'referred',
    'relavant':'relevant',
    'sieze':'seize','seeze':'seize',
    'supercede':'supersede','superceed':'supersede',
    'tyrany':'tyranny','tyranny':'tyranny',
    'underate':'underrate',
    'withhold':'withhold','withold':'withhold',
    'concious':'conscious','concous':'conscious',
    'collegue':'colleague','colleage':'colleague',
    'pasttime':'pastime',
    'potatos':'potatoes','potatoe':'potato',
    'tomatos':'tomatoes','tomatoe':'tomato',
    'presense':'presence','presance':'presence',
    'playwrite':'playwright',
    'romote':'remote',
  };

  // ============================================================
  // LEVENSHTEIN DISTANCE
  // ============================================================
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = Array.from({ length: m + 1 }, (_, i) =>
      Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
    );
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i-1] === b[j-1]
          ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
    return dp[m][n];
  }

  // ============================================================
  // INFLECTION CHECKER (recognizes word forms as valid)
  // ============================================================
  function checkWordInflections(w) {
    if (DICTIONARY.has(w) || CUSTOM_DICTIONARY.has(w)) return true;

    // -s / -es / -ies (plural / 3rd person)
    if (w.endsWith('s')) {
      if (DICTIONARY.has(w.slice(0, -1)) || CUSTOM_DICTIONARY.has(w.slice(0, -1))) return true;
      if (w.endsWith('es') && (DICTIONARY.has(w.slice(0, -2)) || CUSTOM_DICTIONARY.has(w.slice(0, -2)))) return true;
      if (w.endsWith('ies')) {
        const stem = w.slice(0, -3) + 'y';
        if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;
      }
    }

    // -ed (past tense)
    if (w.endsWith('ed')) {
      if (DICTIONARY.has(w.slice(0, -2)) || CUSTOM_DICTIONARY.has(w.slice(0, -2))) return true;
      if (DICTIONARY.has(w.slice(0, -1)) || CUSTOM_DICTIONARY.has(w.slice(0, -1))) return true; // e.g. "used" -> "use"
      if (w.endsWith('ied')) {
        const stem = w.slice(0, -3) + 'y';
        if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;
      }
      // double consonant: "stopped" -> "stop"
      const stem = w.slice(0, -2);
      if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
        if (DICTIONARY.has(stem.slice(0, -1)) || CUSTOM_DICTIONARY.has(stem.slice(0, -1))) return true;
      }
    }

    // -ing (progressive)
    if (w.endsWith('ing')) {
      const base = w.slice(0, -3);
      if (DICTIONARY.has(base) || CUSTOM_DICTIONARY.has(base)) return true;
      if (DICTIONARY.has(base + 'e') || CUSTOM_DICTIONARY.has(base + 'e')) return true; // "creating" -> "create"
      if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
        if (DICTIONARY.has(base.slice(0, -1)) || CUSTOM_DICTIONARY.has(base.slice(0, -1))) return true;
      }
    }

    // -ly (adverb)
    if (w.endsWith('ly')) {
      if (DICTIONARY.has(w.slice(0, -2)) || CUSTOM_DICTIONARY.has(w.slice(0, -2))) return true;
      if (w.endsWith('ily')) {
        const stem = w.slice(0, -3) + 'y';
        if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;
      }
      if (w.endsWith('ally')) {
        const stem = w.slice(0, -4) + 'al';
        if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;
      }
    }

    // -er / -est (comparative / superlative)
    if (w.endsWith('er') && w.length > 3) {
      if (DICTIONARY.has(w.slice(0, -2)) || CUSTOM_DICTIONARY.has(w.slice(0, -2))) return true;
      if (DICTIONARY.has(w.slice(0, -1)) || CUSTOM_DICTIONARY.has(w.slice(0, -1))) return true; // "nicer" -> "nice"
      if (w.endsWith('ier')) {
        const stem = w.slice(0, -3) + 'y';
        if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;
      }
    }
    if (w.endsWith('est') && w.length > 4) {
      if (DICTIONARY.has(w.slice(0, -3)) || CUSTOM_DICTIONARY.has(w.slice(0, -3))) return true;
      if (DICTIONARY.has(w.slice(0, -2)) || CUSTOM_DICTIONARY.has(w.slice(0, -2))) return true;
      if (w.endsWith('iest')) {
        const stem = w.slice(0, -4) + 'y';
        if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;
      }
    }

    // -tion / -sion / -ment / -ness / -ity / -able / -ible / -ful / -less / -ous
    const suffixes = ['tion','sion','ment','ness','ity','able','ible','ful','less','ous','ive','al','ial','ual','ence','ance','ent','ant'];
    for (const suf of suffixes) {
      if (w.endsWith(suf) && w.length > suf.length + 2) {
        const stem = w.slice(0, -suf.length);
        if (DICTIONARY.has(stem) || CUSTOM_DICTIONARY.has(stem)) return true;
        if (DICTIONARY.has(stem + 'e') || CUSTOM_DICTIONARY.has(stem + 'e')) return true;
        if (DICTIONARY.has(stem + 'y') || CUSTOM_DICTIONARY.has(stem + 'y')) return true;
      }
    }

    // un- / re- / pre- / dis- / mis- / over- / under- prefixes
    const prefixes = ['un','re','pre','dis','mis','over','under','out','non'];
    for (const pre of prefixes) {
      if (w.startsWith(pre) && w.length > pre.length + 2) {
        const rest = w.slice(pre.length);
        if (DICTIONARY.has(rest) || CUSTOM_DICTIONARY.has(rest)) return true;
        if (checkWordInflections(rest)) return true; // recursive: "unbelievable" -> "believable" -> "believe"
      }
    }

    return false;
  }

  // ============================================================
  // IS CORRECT
  // ============================================================
  function isCorrect(word) {
    const w = word.toLowerCase().replace(/[^a-z']/g, '');
    if (!w || w.length <= 1) return true;
    if (/^\d+$/.test(w)) return true;
    if (checkWordInflections(w)) return true;
    return false;
  }

  // ============================================================
  // GET SUGGESTIONS (Sajid030 / Peter Norvig Algorithm)
  // Edit Distance + Transpositions + Prefix Bonus + Word Probability
  // ============================================================
  const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

  // 1-Edit Candidate Generator (Deletions, Transpositions, Substitutions, Insertions)
  function edits1(word) {
    const set = new Set();
    const len = word.length;
    for (let i = 0; i < len; i++) {
      // Delete
      set.add(word.slice(0, i) + word.slice(i + 1));
      // Substitute
      for (const c of ALPHABET) {
        set.add(word.slice(0, i) + c + word.slice(i + 1));
      }
    }
    // Transpose
    for (let i = 0; i < len - 1; i++) {
      set.add(word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2));
    }
    // Insert
    for (let i = 0; i <= len; i++) {
      for (const c of ALPHABET) {
        set.add(word.slice(0, i) + c + word.slice(i));
      }
    }
    return set;
  }

  function getSuggestions(word, maxSuggestions = 5) {
    const w = word.toLowerCase();

    // 1. Direct misspelling map (highest priority)
    if (COMMON_MISSPELLINGS[w]) return [COMMON_MISSPELLINGS[w]];

    // 2. Fast letter deduplication: "writting" -> "writing", "playying" -> "playing"
    const dedup = w.replace(/(.)\1{2,}/g, '$1$1').replace(/(.)\1+/g, '$1');
    if (dedup !== w && isCorrect(dedup)) return [dedup];
    const dedup2 = w.replace(/(.)\1{2,}/g, '$1$1');
    if (dedup2 !== w && dedup2 !== dedup && isCorrect(dedup2)) return [dedup2];

    // 3. Edit Distance + Prefix Matching + Probability Scoring (Sajid030 / Norvig Model)
    const candidates = new Map();

    function evaluateCandidate(cand, editDist) {
      if (!isCorrect(cand) || cand === w) return;

      // Longest Common Prefix Bonus (Sajid030 algorithm feature)
      let prefixLen = 0;
      for (let i = 0; i < Math.min(w.length, cand.length); i++) {
        if (w[i] === cand[i]) prefixLen++;
        else break;
      }

      // Word Length & Suffix Bonus
      let suffixLen = 0;
      for (let i = 0; i < Math.min(w.length, cand.length); i++) {
        if (w[w.length - 1 - i] === cand[cand.length - 1 - i]) suffixLen++;
        else break;
      }

      // Composite Score (Lower is better rank)
      // Base score on edit distance, minus prefix bonus and suffix bonus
      let score = editDist * 20 - prefixLen * 5 - suffixLen * 2;
      if (w.length === cand.length) score -= 4;

      if (!candidates.has(cand) || candidates.get(cand).score > score) {
        candidates.set(cand, { word: cand, score, editDist, prefixLen });
      }
    }

    // Pass A: 1-edit distance candidates (instant evaluation)
    const e1 = edits1(w);
    for (const cand of e1) {
      evaluateCandidate(cand, 1);
    }

    // Pass B: 2-edit distance candidates (if 1-edit candidates are few)
    if (candidates.size < 3 && w.length >= 4) {
      for (const cand1 of e1) {
        if (cand1.length < 3) continue;
        const e2 = edits1(cand1);
        for (const cand2 of e2) {
          evaluateCandidate(cand2, 2);
        }
      }
    }

    // Pass C: Search core dictionary for best edit distance matches if candidates still empty
    if (candidates.size === 0) {
      const maxDist = w.length <= 4 ? 1 : w.length <= 8 ? 2 : 3;
      for (const dictWord of DICTIONARY) {
        if (Math.abs(dictWord.length - w.length) > maxDist) continue;
        const dist = levenshtein(w, dictWord);
        if (dist > 0 && dist <= maxDist) {
          evaluateCandidate(dictWord, dist);
        }
      }
    }

    if (candidates.size === 0) return [];

    const sorted = Array.from(candidates.values()).sort((a, b) => a.score - b.score);
    return sorted.slice(0, maxSuggestions).map(c => c.word);
  }

  // ============================================================
  // CUSTOM DICTIONARY
  // ============================================================
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

  // ============================================================
  // CHECK TEXT
  // ============================================================
  function check(text) {
    loadCustomDictionary();
    const errors = [];
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
