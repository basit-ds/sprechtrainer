// Sprechtrainer – Kurs-Lehrplan
// Jede Lektion: id, title, goal, card {form[], examples[], trap}, topics (für gelenktes Sprechen), free (Szenario für freies Sprechen).
// Weitere Niveaus: einfach Listen unter A2 / B2 / C1 ergänzen – die App übernimmt sie automatisch.
window.SYLLABUS = {
  A2: [],
  B2: [],
  C1: [],
  B1: [
    { id:'b1-perfekt', title:'Perfekt mit haben und sein',
      goal:'Flüssig über Vergangenes erzählen: gestern, letztes Wochenende, Urlaub.',
      card:{ form:[
          'haben / sein auf Position 2 + Partizip II am Satzende',
          'sein bei Bewegung von A nach B (gehen, fahren, fliegen, kommen) und bei Zustandswechsel (aufstehen, einschlafen, werden) sowie bei sein, bleiben, passieren',
          'Partizip II: ge…t (gemacht, gearbeitet), ge…en (gesehen, gegangen), kein ge- bei be-, ver-, er-, ent- und -ieren (besucht, verstanden, studiert)' ],
        examples:[ 'Ich habe gestern bis acht Uhr gearbeitet.', 'Wir sind am Wochenende nach Köln gefahren.', 'Er ist um sechs aufgestanden und hat schnell gefrühstückt.' ],
        trap:'„Ich habe nach Hause gegangen“ – Bewegungsverben brauchen sein: „Ich bin nach Hause gegangen.“' },
      topics:'gestern, letztes Wochenende, der letzte Urlaub, der erste Tag in Deutschland, ein typischer Arbeitstag von gestern',
      free:'ein Gespräch unter Kollegen am Montagmorgen über das Wochenende und über eine Reise, die er nie vergessen wird' },

    { id:'b1-praeteritum', title:'Präteritum: war, hatte, Modalverben',
      goal:'Im Erzählen natürlich zwischen Perfekt und war/hatte/konnte/musste/wollte wechseln.',
      card:{ form:[
          'sein → war, warst, war, waren; haben → hatte, hattest, hatte, hatten',
          'Modalverben: konnte, musste, wollte, durfte, sollte (kein Umlaut!) + Infinitiv am Ende',
          'Gesprochenes Deutsch: Perfekt für Handlungen, Präteritum für sein, haben, Modalverben und es gab' ],
        examples:[ 'Gestern war ich müde, weil ich nur vier Stunden geschlafen habe.', 'Ich wollte früher gehen, aber ich musste noch eine Mail schreiben.', 'Es gab keinen Kaffee mehr, deshalb hatte ich schlechte Laune.' ],
        trap:'„Ich bin gestern krank gewesen“ ist korrekt, aber „ich war krank“ klingt natürlicher. Und: „ich könnte“ (Konjunktiv) ≠ „ich konnte“ (Vergangenheit).' },
      topics:'Kindheit, Schulzeit, das Studium, der Umzug nach Deutschland, warum etwas gestern nicht geklappt hat',
      free:'ein Gespräch über die Schulzeit und darüber, was er früher wollte, durfte und musste – im Vergleich zu heute' },

    { id:'b1-nebensatz', title:'Nebensätze mit weil, dass, wenn',
      goal:'Begründen, Meinungen einleiten und Bedingungen nennen – mit dem Verb am Ende.',
      card:{ form:[
          'Konjunktion + … + konjugiertes Verb am Ende: „…, weil ich morgen früh aufstehen muss.“',
          'weil (Grund), dass (nach Verben des Sagens/Denkens: ich glaube, dass …), wenn (Bedingung oder wiederholte Zeit)',
          'Nebensatz vorne → Hauptsatz beginnt mit dem Verb: „Wenn es regnet, bleibe ich zu Hause.“' ],
        examples:[ 'Ich lerne Deutsch, weil ich hier arbeiten möchte.', 'Ich finde, dass Bochum eine unterschätzte Stadt ist.', 'Wenn ich Zeit habe, gehe ich ins Fitnessstudio.' ],
        trap:'Verb zu früh: „weil ich habe keine Zeit“ → „weil ich keine Zeit habe“. Im Perfekt steht haben/sein ganz am Ende: „…, weil ich gestern lange gearbeitet habe.“' },
      topics:'Warum lernst du Deutsch, warum Bochum, was machst du, wenn du gestresst bist, was glaubst du über das Wetter in Deutschland',
      free:'eine Diskussion mit einer Freundin, ob man lieber in der Stadt oder auf dem Land wohnen sollte – mit vielen Begründungen' },

    { id:'b1-konnektoren', title:'obwohl, trotzdem, deshalb, denn',
      goal:'Gegensätze und Folgen ausdrücken und dabei die Wortstellung sicher treffen.',
      card:{ form:[
          'obwohl = Nebensatz (Verb am Ende): „Obwohl es regnet, gehe ich raus.“',
          'trotzdem, deshalb, deswegen, darum = Position 1 im Hauptsatz, danach sofort das Verb: „Es regnet, trotzdem gehe ich raus.“',
          'denn = Hauptsatz-Wortstellung bleibt: „Ich bleibe zu Hause, denn ich bin müde.“ (wie aber, und, oder)' ],
        examples:[ 'Obwohl ich wenig Zeit habe, gehe ich dreimal pro Woche trainieren.', 'Die Prüfung ist schwer, trotzdem bin ich optimistisch.', 'Ich fahre mit dem Rad, deshalb brauche ich kein Auto.' ],
        trap:'„Trotzdem ich gehe …“ – nach trotzdem/deshalb kommt sofort das Verb: „Trotzdem gehe ich …“' },
      topics:'Sport trotz Stress, Gründe für Entscheidungen, Deutschland-Klischees, warum etwas trotzdem gut war',
      free:'ein Gespräch mit einem Kollegen, der ihn vom Autokauf überzeugen will – er argumentiert dagegen mit obwohl, trotzdem und deshalb' },

    { id:'b1-temporal', title:'als, wenn, während, bevor, nachdem',
      goal:'Erlebnisse in der richtigen Reihenfolge erzählen.',
      card:{ form:[
          'als = einmaliges Ereignis in der Vergangenheit; wenn = wiederholt oder Gegenwart/Zukunft („Immer wenn …“)',
          'bevor / während / nachdem / seit / bis = Nebensätze mit Verb am Ende',
          'nachdem: Vorzeitigkeit – „Nachdem ich gegessen hatte, bin ich losgefahren.“ (Plusquamperfekt oder einfach Perfekt + Perfekt im Gespräch)' ],
        examples:[ 'Als ich nach Deutschland gekommen bin, habe ich kein Wort verstanden.', 'Während ich koche, höre ich Podcasts.', 'Bevor ich schlafen gehe, lese ich noch ein bisschen.' ],
        trap:'„Wenn ich nach Deutschland gekommen bin …“ – einmal in der Vergangenheit = als.' },
      topics:'die Ankunft in Deutschland, ein typischer Morgen, was er macht, während er pendelt, was er vor dem Schlafengehen tut',
      free:'er erzählt einer neuen Bekannten die Geschichte seines Umzugs nach Deutschland, sie fragt nach Details und Reihenfolge' },

    { id:'b1-konjunktiv2', title:'Konjunktiv II: würde, hätte, wäre, könnte',
      goal:'Wünsche, höfliche Bitten und irreale Bedingungen ausdrücken.',
      card:{ form:[
          'würde + Infinitiv für fast alle Verben: „Ich würde gern mehr reisen.“',
          'Eigene Formen: wäre, hätte, könnte, müsste, sollte, dürfte, wüsste, gäbe',
          'Irreale Bedingung: „Wenn ich mehr Zeit hätte, würde ich jeden Tag lesen.“ – Höflichkeit: „Könnten Sie mir helfen?“' ],
        examples:[ 'Wenn ich reich wäre, würde ich ein Haus am Meer kaufen.', 'Ich hätte gern einen Kaffee.', 'An deiner Stelle würde ich den Job annehmen.' ],
        trap:'„Wenn ich würde Zeit haben“ → „Wenn ich Zeit hätte“. Und: „ich möchte“ ist schon Konjunktiv II von mögen.' },
      topics:'Lottogewinn, Traumjob, was er anders machen würde, Ratschläge für einen Freund, höfliche Bitten im Café und im Büro',
      free:'ein Gespräch über ein Jahr Auszeit: Was würde er machen, wohin würde er gehen, was wäre schwierig?' },

    { id:'b1-wechselpraep', title:'Wechselpräpositionen: wo? / wohin?',
      goal:'Orte und Bewegungen sicher mit Dativ oder Akkusativ beschreiben.',
      card:{ form:[
          'an, auf, hinter, in, neben, über, unter, vor, zwischen',
          'wo? (Ort, keine Bewegung) → Dativ: „Ich bin im Büro.“ / wohin? (Richtung) → Akkusativ: „Ich gehe ins Büro.“',
          'Kurzformen: im, am, ins, ans; Verben: stehen/stellen, liegen/legen, sitzen/setzen, hängen' ],
        examples:[ 'Das Handy liegt auf dem Tisch. – Ich lege das Handy auf den Tisch.', 'Wir treffen uns vor dem Kino.', 'Sie hängt das Bild an die Wand.' ],
        trap:'„Ich gehe in dem Supermarkt“ → Richtung = Akkusativ: „in den Supermarkt“.' },
      topics:'sein Zimmer beschreiben, der Weg zur Arbeit, wo er einkauft und wohin er am Wochenende geht, Umzug und Möbel stellen',
      free:'er zieht um und erklärt einem Freund per Telefon, wo die Möbel hinsollen und wo was schon steht' },

    { id:'b1-verben-praep', title:'Verben mit Präpositionen',
      goal:'Häufige Verb-Präposition-Paare automatisch richtig verwenden.',
      card:{ form:[
          'Lernen als Paket: warten auf + A, sich freuen auf + A (Zukunft) / über + A (jetzt), sich interessieren für + A, denken an + A, sich kümmern um + A, träumen von + D, sprechen mit + D / über + A, teilnehmen an + D',
          'Fragen: wo(r) + Präposition: Worauf wartest du? Wofür interessierst du dich? – bei Personen: Auf wen wartest du?',
          'Antwort mit da(r) + Präposition: „Darauf freue ich mich schon.“' ],
        examples:[ 'Ich freue mich auf das Wochenende.', 'Worüber habt ihr gesprochen? – Über die Prüfung.', 'Sie kümmert sich um die Anmeldung.' ],
        trap:'„Ich interessiere mich in …“ → „für“. „Ich warte für dich“ → „auf dich“.' },
      topics:'worauf er sich freut, wofür er sich interessiert, woran er oft denkt, mit wem er über Probleme spricht, wovon er träumt',
      free:'ein Kennenlerngespräch in einem Sprachcafé: Interessen, Pläne, Sorgen – mit vielen Fragen hin und her' },

    { id:'b1-reflexiv', title:'Reflexive Verben',
      goal:'Alltagsverben wie sich erinnern, sich ärgern, sich vorbereiten natürlich benutzen.',
      card:{ form:[
          'Reflexivpronomen: mich, dich, sich, uns, euch, sich – Position direkt nach dem konjugierten Verb',
          'Immer reflexiv: sich erinnern an, sich beeilen, sich erholen, sich konzentrieren auf, sich bedanken für, sich verabreden mit',
          'Dativ-Reflexiv, wenn ein Akkusativobjekt folgt: „Ich wasche mir die Hände.“ „Ich stelle mir vor, dass …“' ],
        examples:[ 'Ich erinnere mich gut an meinen ersten Tag.', 'Wir müssen uns beeilen, der Zug fährt gleich.', 'Hast du dich schon auf die Prüfung vorbereitet?' ],
        trap:'„Ich erinnere an …“ ohne mich ist falsch (oder bedeutet etwas anderes). Im Nebensatz: „…, weil ich mich nicht konzentrieren kann.“' },
      topics:'wie er sich auf die Prüfung vorbereitet, worüber er sich ärgert, wie er sich am Wochenende erholt, woran er sich gern erinnert',
      free:'ein Gespräch über Stress im Alltag: wie man sich entspannt, sich konzentriert, sich organisiert' },

    { id:'b1-relativ', title:'Relativsätze',
      goal:'Personen und Dinge genauer beschreiben, statt kurze Sätze aneinanderzureihen.',
      card:{ form:[
          'Relativpronomen = Artikel-Formen: der/die/das, den, dem, denen; Verb am Ende',
          'Genus und Numerus vom Bezugswort, Kasus vom Relativsatz: „der Kollege, den ich gestern getroffen habe“ (Akkusativ)',
          'Mit Präposition: „die Stadt, in der ich wohne“; „die Freunde, mit denen ich reise“' ],
        examples:[ 'Das ist der Film, der mir am besten gefallen hat.', 'Ich habe eine Kollegin, die aus Spanien kommt.', 'Das Projekt, an dem ich arbeite, dauert zwei Jahre.' ],
        trap:'„Der Mann, wo …“ – im Standard nur der/die/das. Und das Verb muss ans Ende: „…, der in Essen wohnt.“' },
      topics:'Lieblingsstadt, ein Mensch, der ihn beeinflusst hat, sein Projekt, ein Gerät, das er täglich benutzt',
      free:'er beschreibt einer Freundin Leute und Orte aus seinem Alltag (Chef, Nachbarn, Lieblingscafé), sie fragt nach: Wer ist das? Wo ist das?' },

    { id:'b1-adjektiv', title:'Adjektivendungen (Grundmuster)',
      goal:'Die häufigsten Endungen nach der, ein und ohne Artikel sicher treffen.',
      card:{ form:[
          'Nach der/die/das: fast immer -en, außer Nominativ Singular (-e) und Akkusativ Singular feminin/neutrum (-e): der neue Job, die neue Wohnung, das neue Auto, den neuen Job',
          'Nach ein/kein/mein: Nominativ zeigt das Genus: ein neuer Job, eine neue Wohnung, ein neues Auto; sonst meist -en',
          'Ohne Artikel: Adjektiv übernimmt die Artikel-Endung: guter Kaffee, kaltes Wasser, frische Brötchen' ],
        examples:[ 'Ich habe einen interessanten Job in einem kleinen Institut.', 'Die neue Kollegin kommt aus Italien.', 'Ich trinke morgens starken Kaffee.' ],
        trap:'„ein neue Job“ → „ein neuer Job“. Im Zweifel: nach dem/der/den/einem/einer → -en.' },
      topics:'seine Wohnung beschreiben, Lieblingsessen, die ideale Stadt, Kleidung, ein gutes Restaurant',
      free:'ein Gespräch über Wohnungssuche: Was für eine Wohnung sucht er, in welcher Gegend, mit welchen Nachbarn?' },

    { id:'b1-komparativ', title:'Komparativ und Superlativ',
      goal:'Vergleichen und bewerten: größer als, genauso wie, am besten.',
      card:{ form:[
          'Komparativ: -er (+ Umlaut bei kurzen Adjektiven): größer, älter, teurer – Vergleich mit als',
          'Gleichheit: (genau)so … wie: „Bochum ist genauso groß wie Wuppertal.“',
          'Superlativ: am -sten (prädikativ) / der -ste (vor Nomen); unregelmäßig: gut–besser–am besten, viel–mehr–am meisten, gern–lieber–am liebsten' ],
        examples:[ 'Das Fitnessstudio ist näher als die Uni.', 'Ich koche lieber, als ich bestelle.', 'Am liebsten arbeite ich morgens.' ],
        trap:'„besser wie“ ist Umgangssprache – Standard ist „besser als“. Und: „mehr groß“ gibt es nicht → „größer“.' },
      topics:'Stadt vs. Land, Deutschland vs. Heimatland, Sportarten, Jahreszeiten, Verkehrsmittel',
      free:'eine Diskussion, welche Stadt im Ruhrgebiet die beste ist – er vergleicht mit allem, was ihm einfällt' },

    { id:'b1-passiv', title:'Passiv Präsens und Präteritum',
      goal:'Vorgänge beschreiben, ohne den Handelnden zu nennen (Arbeit, Nachrichten, Behörden).',
      card:{ form:[
          'werden + Partizip II: „Die Daten werden jeden Tag gespeichert.“',
          'Präteritum: wurde + Partizip II: „Das Gebäude wurde 1960 gebaut.“',
          'Mit Modalverb: „Der Antrag muss online gestellt werden.“ – Handelnder mit von + Dativ' ],
        examples:[ 'In unserem Institut werden viele Projekte international finanziert.', 'Die Zeche wurde 1980 geschlossen.', 'Das Formular kann auch per Post geschickt werden.' ],
        trap:'„Das Haus ist 1960 gebaut“ beschreibt nur den Zustand – der Vorgang heißt „wurde gebaut“.' },
      topics:'wie bei ihm gearbeitet wird, was in Bochum früher produziert wurde, wie eine Anmeldung gemacht wird, was in Deutschland recycelt wird',
      free:'er erklärt einem Besucher, wie sein Institut funktioniert und was mit den alten Bergwerken passiert ist bzw. gemacht wird' },

    { id:'b1-infinitiv', title:'Infinitiv mit zu, um … zu, damit',
      goal:'Pläne, Absichten und Ziele ausdrücken.',
      card:{ form:[
          'Nach vielen Verben und Ausdrücken: Ich habe vor / versuche / habe keine Lust / es ist wichtig, … zu + Infinitiv (zu steht vor dem Infinitiv, bei trennbaren Verben dazwischen: anzurufen)',
          'Ziel: um … zu + Infinitiv, wenn das Subjekt gleich bleibt: „Ich lerne, um die Prüfung zu bestehen.“',
          'damit + Nebensatz, wenn das Subjekt wechselt: „Ich spreche langsam, damit mich alle verstehen.“' ],
        examples:[ 'Ich habe vor, nächstes Jahr in Deutschland zu arbeiten.', 'Ich gehe ins Fitnessstudio, um den Kopf freizubekommen.', 'Sie erklärt es noch einmal, damit ich es verstehe.' ],
        trap:'Kein zu nach Modalverben und nach lassen, gehen, sehen, hören: „Ich muss arbeiten“, „Ich gehe einkaufen“.' },
      topics:'Pläne für das nächste Jahr, warum er Deutsch lernt, was er versucht zu ändern, wofür er Sport macht',
      free:'ein Gespräch über Ziele für die nächsten fünf Jahre – beruflich, privat, sprachlich' },

    { id:'b1-indirekte-frage', title:'Indirekte Fragen und höfliches Nachfragen',
      goal:'Höflich fragen und Verständnisprobleme elegant lösen.',
      card:{ form:[
          'Ja/Nein-Frage → ob: „Wissen Sie, ob der Zug pünktlich ist?“',
          'W-Frage → W-Wort + Verb am Ende: „Können Sie mir sagen, wo der Ausgang ist?“',
          'Einleitungen: Ich wüsste gern, …; Könnten Sie mir sagen, …; Ich habe nicht verstanden, was …' ],
        examples:[ 'Ich möchte wissen, ob ich den Antrag online stellen kann.', 'Könnten Sie mir erklären, wie das funktioniert?', 'Ich bin nicht sicher, wann die Besprechung anfängt.' ],
        trap:'„Wissen Sie, wo ist der Bahnhof?“ → „…, wo der Bahnhof ist?“ – im Nebensatz Verb ans Ende.' },
      topics:'Fragen an das Bürgeramt, an einen Vermieter, an den Chef, Nachfragen im Gespräch, wenn man etwas nicht verstanden hat',
      free:'ein Telefonat mit einer Behörde: er muss viele Informationen höflich erfragen und nachhaken' },

    { id:'b1-futur', title:'Über die Zukunft sprechen',
      goal:'Pläne, Vermutungen und Versprechen ausdrücken – mit Präsens oder werden.',
      card:{ form:[
          'Pläne meistens im Präsens + Zeitangabe: „Nächste Woche fahre ich nach Berlin.“',
          'Futur I (werden + Infinitiv) für Vermutungen, Versprechen und Betonung: „Das wird schon klappen.“ „Ich werde dich anrufen.“',
          'Vermutung mit wohl / wahrscheinlich / bestimmt: „Er wird wohl noch im Meeting sein.“' ],
        examples:[ 'In drei Monaten gebe ich meine Masterarbeit ab.', 'Ich werde auf jeden Fall weiter Deutsch lernen.', 'Morgen wird es wahrscheinlich regnen.' ],
        trap:'Nicht jeden Zukunftssatz mit werden bilden – „Morgen werde ich arbeiten gehen“ klingt steif; natürlicher: „Morgen gehe ich arbeiten.“' },
      topics:'Pläne für die nächsten Wochen, Vermutungen über Kollegen, Versprechen, wie Bochum in 20 Jahren aussehen wird',
      free:'ein Gespräch über das Leben in zehn Jahren: Wo wird er wohnen, was wird er arbeiten, was wird sich in Deutschland verändert haben?' }
  ]
};
