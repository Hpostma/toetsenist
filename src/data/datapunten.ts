export interface Criterion {
    id: string;
    title: string;
    description: string;
    levels: {
        development: string;
        level: string;
        above: string;
    };
}

export interface Datapunt {
    id: string;
    title: string;
    description: string;
    deliverables: string[];
    criteria: Criterion[];
}

export const datapunten: Datapunt[] = [
    {
        id: "6A",
        title: "Datapunt 6A: Design Sprint",
        description: "Je presenteert met je projectgroep de resultaten van de eerste design sprint week. Hierbij doorloop je de 6 fases van Design Thinking en werk je toe naar een eerste antwoord op het ontwerpprobleem van je gekozen opdrachtgever.",
        deliverables: [
            "Groepspresentatie van 10 minuten met proces en resultaten",
            "Documentatie van gebruikte methoden en inzichten",
            "Individuele verantwoording van eigen bijdrage"
        ],
        criteria: [
            {
                id: "BC 6.1.1",
                title: "Analyse van wensen en behoeften belanghebbenden",
                description: "Je analyseert met passende methoden wensen en behoeften van belanghebbenden in relatie tot bestaande digitale interfaces.",
                levels: {
                    development: "Je gebruikt basis onderzoeksmethoden zoals enquête of kort interview zonder onderbouwing waarom deze passend zijn. Je identificeert alleen directe gebruikers zonder bredere belanghebbenden zoals opdrachtgever of beheerders mee te nemen. Je maakt geen expliciete verbinding tussen gevonden behoeften en problemen met bestaande interfaces.",
                    level: "Je kiest bewust passende onderzoeksmethoden zoals user interviews, observatie of stakeholder mapping en verantwoordt deze keuzes. Je identificeert alle relevante belanghebbenden en analyseert hun verschillende wensen en behoeften systematisch. Je koppelt bevindingen expliciet aan specifieke problemen of kansen in bestaande digitale interfaces.",
                    above: "Je combineert meerdere onderzoeksmethoden voor betrouwbare inzichten. Je analyseert belangen tussen verschillende stakeholders en prioriteert op haalbaarheid. Je identificeert onderliggende behoeften die niet direct worden uitgesproken en vertaalt deze naar concrete verbeteringen."
                }
            },
            {
                id: "BC 6.3.1",
                title: "Tonen ontwerpproces met divergeren en convergeren",
                description: "Je toont hoe jij je ontwerpproces hebt doorlopen en hoe jij door middel van divergeren en convergeren een gericht antwoord hebt gezocht voor je ontwerpvraag.",
                levels: {
                    development: "Je documenteert minimaal je ontwerpstappen zonder duidelijke structuur of logische volgorde. Je toont geen bewuste momenten van divergeren en convergeren of springt willekeurig tussen breed en smal denken. Je legt geen verband tussen je ontwerpproces en hoe dit heeft geleid tot je uiteindelijke antwoord.",
                    level: "Je formuleert samen met jouw team een ontwerpvraag volgens aangereikte methode in de propedeuse. Je laat zien hoe jij met jouw team het ontwerpproces doorlopen hebt. Je maakt duidelijk wat hierin jouw aandeel was. Je zet methodes in om tot een hoeveelheid oplossingsrichtingen te komen. Je laat de gemaakte stappen zien om tot een gericht antwoord te komen.",
                    above: "Je visualiseert je complete ontwerpproces inclusief iteraties, terugkoppelingen en beslismomenten. Je analyseert wanneer en waarom je kiest voor divergeren of convergeren in verschillende fases. Je reflecteert kritisch op de effectiviteit van je gekozen proces en formuleert verbeteringen voor toekomstige projecten."
                }
            }
        ]
    },
    {
        id: "6B",
        title: "Datapunt 6B: Start Loop 2 - Creative Brief",
        description: "Je stelt een creative brief op waarin je de ontwerpvraag, doelgroep, randvoorwaarden en belangrijkste inzichten voor je specifieke opdrachtgever samenvat.",
        deliverables: [
            "Creative brief document met maximaal 2 pagina's",
            "Visualisatie van belanghebbenden en hun behoeften",
            "Reflectie op feedback uit design sprint en vervolgstappen",
            "Individuele verantwoording van eigen bijdrage en het proces"
        ],
        criteria: [
            {
                id: "BC 6.3.2",
                title: "Doel- en doelgroepgerichte verantwoording",
                description: "Je verantwoordt, doel- en doelgroepgericht, je keuzes en ontwerpresultaten.",
                levels: {
                    development: "Je geeft algemene redenen voor je keuzes zonder specifieke verbinding naar doel of doelgroep. Je baseert verantwoordingen op persoonlijke voorkeur zoals 'ik vond het mooi' in plaats van objectieve criteria. Je toont geen duidelijke link tussen je ontwerpkeuzes en de behoeften van je specifieke doelgroep.",
                    level: "Je verantwoordt elke belangrijke keuze met concrete verwijzingen naar projectdoel en doelgroepbehoeften. Je onderbouwt beslissingen met onderzoek zoals user research, benchmarks of literatuur en design principes. Je laat zien hoe je keuzes specifiek bijdragen aan het oplossen van het probleem voor je doelgroep.",
                    above: "Alle ontwerpkeuzes zijn helder en consistent verantwoord. Je koppelt keuzes aan meetbare criteria en toont aan waarom je oplossing optimaal is voor doel en doelgroep. Je anticipeert op kritische vragen en bereidt sterke argumenten voor die je standpunten ondersteunen."
                }
            },
            {
                id: "BC 6.5.1",
                title: "Regelmatige reflectie met concrete lessen",
                description: "Je reflecteert regelmatig op diverse ontwerpactiviteiten en formuleert concrete lessen voor een volgende keer.",
                levels: {
                    development: "Je beschrijft minder dan 2 momenten met korte notities over wat je hebt gedaan zonder analyse. Je formuleert vage leerdoelen die te algemeen zijn om toe te passen zoals 'volgende keer beter voorbereiden'. Je reflecteert alleen achteraf wanneer het project al af is.",
                    level: "Je beschrijft tenminste 2 concrete voorbeelden. Je formuleert met behulp van een reflectiemodel een nieuw leerdoel die direct toepasbaar is voor je volgende ontwerpactiviteit. Je documenteert voor- en na vergelijkingen van hoe je eerdere lessen hebt toegepast.",
                    above: "Je maakt gebruik van een reflectiemethode die is onderbouwd met een reden. Je deelt je reflecties met anderen en zet deze inzichten om naar nieuwe leerdoelen. Je houdt een uitgebreid reflectiedagboek bij waarin je patronen herkent. Je experimenteert bewust met nieuwe ontwerpactiviteiten en evalueert hun effectiviteit systematisch. Je deelt je reflecties met anderen en begeleidt teamgenoten in hun reflectieproces."
                }
            }
        ]
    },
    {
        id: "6C",
        title: "Datapunt 6C: Inspiration Wall & IPV",
        description: "Je levert een 'inspiration wall' op met relevante voorbeelden die helpen bij het verkennen van verschillende ontwerprichtingen voor de gekozen casus.",
        deliverables: [
            "Een digitale of fysieke inspiration wall",
            "Inrichting van het ontwerpproces met methodes en technieken",
            "Een ingevuld IPV-formulier met persoonlijke doelen en teamafspraken",
            "Een reflectie op de feedback van teamgenoten over je rol binnen het project"
        ],
        criteria: [
            {
                id: "BC 6.1.1",
                title: "Analyse van wensen en behoeften belanghebbenden",
                description: "Je analyseert met passende methoden wensen en behoeften van belanghebbenden in relatie tot bestaande digitale interfaces.",
                levels: {
                    development: "Je gebruikt basis onderzoeksmethoden zoals enquête of kort interview zonder onderbouwing waarom deze passend zijn. Je identificeert alleen directe gebruikers zonder bredere belanghebbenden zoals opdrachtgever of beheerders mee te nemen. Je maakt geen expliciete verbinding tussen gevonden behoeften en problemen met bestaande interfaces.",
                    level: "Je kiest bewust passende onderzoeksmethoden zoals user interviews, observatie of stakeholder mapping en verantwoordt deze keuzes. Je identificeert alle relevante belanghebbenden en analyseert hun verschillende wensen en behoeften systematisch. Je koppelt bevindingen expliciet aan specifieke problemen of kansen in bestaande digitale interfaces.",
                    above: "Je combineert meerdere onderzoeksmethoden voor betrouwbare inzichten. Je analyseert belangen tussen verschillende stakeholders en prioriteert op haalbaarheid. Je identificeert onderliggende behoeften die niet direct worden uitgesproken en vertaalt deze naar concrete verbeteringen."
                }
            },
            {
                id: "BC 6.1.2",
                title: "Verantwoording ontwerpproces",
                description: "Je legt uit waarom jouw ontwerpproces aansluit bij de specifieke wensen en behoeften van belanghebbenden.",
                levels: {
                    development: "Er is geen link tussen het ontwerp en de criteria. De link tussen de ingezette methodes en technieken en de doelgroep of belanghebbenden ontbreekt.",
                    level: "Je laat zien hoe je de wensen en behoeftes uit 6.1.1 hebt vertaald naar ontwerpcriteria. Je laat duidelijk zien hoe jouw ontwerp voldoet aan de ontwerpcriteria. Welke methodische aanpak zet je in en je legt uit waarom deze methodes passend zijn. Je hebt de juiste stappen ondernomen die aansluiten bij het doel en de subdoelen.",
                    above: "Je maakt visueel hoe je de link hebt gemaakt tussen ontwerp en ontwerpcriteria. Je legt duidelijk en overtuigend uit hoe en waarom jouw ontwerpproces aansluit bij de specifieke wensen en behoeften van de belanghebbenden."
                }
            },
            {
                id: "BC 6.4.1",
                title: "Rol en afspraken binnen projectgroep",
                description: "Je benoemt in samenspraak met je teamgenoten welke rol je opneemt binnen jouw projectgroep en maakt concrete afspraken met betrekking tot jullie samenwerking.",
                levels: {
                    development: "Je documenteert geen tot weinig concrete afspraken zonder specifieke taken of deadlines. Je maakt geen schriftelijk overzicht van je rol en verantwoordelijkheden. Je houdt geen planning bij voor je onderdelen van het project. Je maakt geen samenwerkingsafspraken die terug te vinden zijn.",
                    level: "Je beschrijft een rolanalyse waarin je beargumenteert welke rol bij je past. Je maakt een takenlijst met concrete afspraken over wie wat doet en wanneer. Je documenteert alle teamafspraken in gedeelde documenten of verslagen. Je houdt een planning bij met deadlines en tussendoelen voor je taken.",
                    above: "Je analyseert kritisch je eigen rol binnen het team en stelt verbeteringen voor. Je anticipeert op mogelijke problemen en maakt afspraken over hoe jullie daarmee omgaan. Je monitort proactief de voortgang van teamgenoten en biedt ondersteuning waar nodig. Je past flexibel je rol aan wanneer de situatie daarom vraagt en communiceert dit helder. Je initieert regelmatige evaluatiemomenten om de samenwerking te verbeteren."
                }
            },
            {
                id: "BC 6.4.2",
                title: "Evaluatie functioneren op basis van feedback",
                description: "Je evalueert jouw functioneren binnen de projectgroep op basis van feedback van teamgenoten en docenten en laat zien hoe je deze feedback verwerkt hebt.",
                levels: {
                    development: "Je verzamelt geen tot weinig feedback, minder dan 2 feedbackformulieren of gesprekverslagen. Je schrijft korte, oppervlakkige reflecties zonder concrete verbeterpunten. Je gebruikt alleen zelfbeoordeling zonder externe feedback.",
                    level: "Je verzamelt feedback van minimaal 3 teamgenoten en 1 docent, schriftelijk vastgelegd. Je schrijft een reflectieverslag waarin je feedback analyseert en verbeterpunten benoemt. Je documenteert concrete acties die je hebt ondernomen naar aanleiding van feedback.",
                    above: "Je schrijft een ontwikkelplan met tijdlijn en meetbare doelen. Je documenteert concrete case-studies van hoe je feedback hebt toegepast. Je creëert een portfolio eigen werk en reflecties op groei. Je schrijft peer-feedback voor teamgenoten met constructieve verbeterpunten."
                }
            }
        ]
    },
    {
        id: "6D",
        title: "Datapunt 6D: White Cube LOFI",
        description: "Je exposeert de huidige staat van je White Cube-prototype en legt uit hoe je dit gaat realiseren in je definitieve prototype.",
        deliverables: [
            "Schetsen, moodboard en technische uitwerkingen van jouw concept",
            "Reflectie met verbeterpunten voor het volgende datapunt"
        ],
        criteria: [
            {
                id: "BC 6.2.2",
                title: "Realiseren prototype met werkende interacties",
                description: "Je realiseert een prototype met werkende interactiemogelijkheden door het toepassen van microcontrollers, sensoren en actuatoren of Virtual, Augmented of Mixed Reality.",
                levels: {
                    development: "Je hebt minimaal geexperimenteerd met de verschillende technieken.",
                    level: "Het prototype geeft een duidelijk beeld van het gekozen onderwerp. Het prototype bevat werkende interactie met sensoren en actuatoren. AR of VR functioneert. Ontwerp en vormgeving van het prototype met toegepaste technieken sluiten op elkaar aan.",
                    above: "Je hebt veel geexperimenteerd met het toepassen van AR, VR en microcontroller op de cube."
                }
            },
            {
                id: "BC 6.5.1",
                title: "Regelmatige reflectie met concrete lessen",
                description: "Je reflecteert regelmatig op diverse ontwerpactiviteiten en formuleert concrete lessen voor een volgende keer.",
                levels: {
                    development: "Je beschrijft minder dan 2 momenten met korte notities over wat je hebt gedaan zonder analyse. Je formuleert vage leerdoelen die te algemeen zijn om toe te passen zoals 'volgende keer beter voorbereiden'. Je reflecteert alleen achteraf wanneer het project al af is.",
                    level: "Je beschrijft tenminste 2 concrete voorbeelden. Je formuleert met behulp van een reflectiemodel een nieuw leerdoel die direct toepasbaar is voor je volgende ontwerpactiviteit. Je documenteert voor- en na vergelijkingen van hoe je eerdere lessen hebt toegepast.",
                    above: "Je maakt gebruik van een reflectiemethode die is onderbouwd met een reden. Je deelt je reflecties met anderen en zet deze inzichten om naar nieuwe leerdoelen. Je houdt een uitgebreid reflectiedagboek bij waarin je patronen herkent. Je experimenteert bewust met nieuwe ontwerpactiviteiten en evalueert hun effectiviteit systematisch. Je deelt je reflecties met anderen en begeleidt teamgenoten in hun reflectieproces."
                }
            }
        ]
    },
    {
        id: "6E",
        title: "Datapunt 6E: Experience Prototype + Assessment",
        description: "Voor dit datapunt laat je de opdrachtgever de eerste uitwerking van het ontwerpprobleem ervaren via een 'experience prototype'.",
        deliverables: [
            "Ervaarbaar ontwerpoplossing gepresenteerd aan de opdrachtgever",
            "Theoretische verantwoording van ontwerpkeuzes",
            "Individuele verantwoording van eigen bijdrage en het proces",
            "Reflectie op persoonlijke ontwikkeling met leerambities en plan"
        ],
        criteria: [
            {
                id: "BC 6.2.1",
                title: "Experimenteren met ideation en prototyping",
                description: "Je experimenteert veelvuldig met ideation- en prototypingtechnieken om alternatieve oplossingen te verkennen van het interactie-ontwerp, de gebruikerservaringen en de vormgeving.",
                levels: {
                    development: "Je hebt enkele experimenten uitgevoerd. Je bent met 1 oplossing aan de slag gegaan.",
                    level: "Je laat een aantal relevante experimenten zien op gebied van interactie, gebruikerservaring en vormgeving. Je legt hierbij kort, bondig en navolgbaar uit: wat heb je gedaan, hoe heb je het aangepakt, wat was de conclusie en wat neem je mee in jouw ontwerp.",
                    above: "Je experimenteert uitgebreid en effectief met diverse ideation- en prototypingtechnieken om alternatieve oplossingen te verkennen. Je onderzoekt verschillende benaderingen van interactie-ontwerp, gebruikerservaringen en vormgeving, en past deze inzichten consequent toe."
                }
            },
            {
                id: "BC 6.2.3",
                title: "Theoretische verantwoording prototypes",
                description: "Je verantwoordt met behulp van relevante theorie dat jouw prototypes aansluiten bij je ontwerpvraag en ontwerpeisen.",
                levels: {
                    development: "Er is geen link tussen ingebrachte theorie en het prototype.",
                    level: "Je legt uit en laat zien welke theorieën je zoal hebt gebruikt en hoe dit aansluit bij jouw prototypes. Denk aan interactie theorie, gestalt, grafische ontwerpprincipes, semiothiek, experience design, storytelling, design for emotion of interactieprincipes van Don Norman.",
                    above: "Je hebt je verdiept in niet aangereikte literatuur. Je maakt effectief gebruik van relevante theorieën om duidelijk te verantwoorden hoe jouw prototypes aansluiten bij de ontwerpvraag en ontwerpeisen. De theorie is correct toegepast tijdens het ontwerpproces en onderbouwt je keuzes overtuigend."
                }
            },
            {
                id: "BC 6.3.2",
                title: "Doel- en doelgroepgerichte verantwoording",
                description: "Je verantwoordt, doel- en doelgroepgericht, je keuzes en ontwerpresultaten.",
                levels: {
                    development: "Je geeft algemene redenen voor je keuzes zonder specifieke verbinding naar doel of doelgroep. Je baseert verantwoordingen op persoonlijke voorkeur zoals 'ik vond het mooi' in plaats van objectieve criteria. Je toont geen duidelijke link tussen je ontwerpkeuzes en de behoeften van je specifieke doelgroep.",
                    level: "Je verantwoordt elke belangrijke keuze met concrete verwijzingen naar projectdoel en doelgroepbehoeften. Je onderbouwt beslissingen met onderzoek zoals user research, benchmarks of literatuur en design principes. Je laat zien hoe je keuzes specifiek bijdragen aan het oplossen van het probleem voor je doelgroep.",
                    above: "Alle ontwerpkeuzes zijn helder en consistent verantwoord. Je koppelt keuzes aan meetbare criteria en toont aan waarom je oplossing optimaal is voor doel en doelgroep. Je anticipeert op kritische vragen en bereidt sterke argumenten voor die je standpunten ondersteunen."
                }
            },
            {
                id: "BC 6.5.2",
                title: "Reflectie op ontwikkeling als ontwerper",
                description: "Je reflecteert op je algehele ontwikkeling als ontwerper en hebt passende leerambities en -doelen inclusief plan opgesteld voor de komende periode.",
                levels: {
                    development: "Je schrijft oppervlakkige reflecties over je ontwikkeling zonder concrete sterke of zwakke punten te benoemen. Je stelt vage leerambities zonder specifieke vaardigheden of tijdlijn. Je maakt geen concreet leerplan of actieplan voor hoe je je doelen gaat bereiken.",
                    level: "Je analyseert systematisch je sterke en zwakke punten als ontwerper met concrete voorbeelden uit je werk. Je formuleert SMART leerambities voor specifieke vaardigheden. Je maakt een uitgewerkt leerplan met concrete acties, bronnen en planning voor de komende periode.",
                    above: "Je reflecteert op je ontwikkeling in relatie tot trends en ontwikkelingen. Je stelt leerambities die aansluiten bij je persoonlijke doelstelling en specialisatie als ontwerper. Je ontwikkelt een leerplan dat je regelmatig evalueert en aanpast op basis van nieuwe inzichten."
                }
            }
        ]
    },
    {
        id: "6F",
        title: "Datapunt 6F: White Cube HIFI",
        description: "Je exposeert de uiteindelijke uitwerking van jouw white cube. Dit is een ervaringsobject met werkende interactiemogelijkheden.",
        deliverables: [
            "Werkend prototype met documentatie van de experimenten",
            "Reflectie op persoonlijke ontwikkeling"
        ],
        criteria: [
            {
                id: "BC 6.2.2",
                title: "Realiseren prototype met werkende interacties",
                description: "Je realiseert een prototype met werkende interactiemogelijkheden door het toepassen van microcontrollers, sensoren en actuatoren of Virtual, Augmented of Mixed Reality.",
                levels: {
                    development: "Je hebt minimaal geëxperimenteerd met de verschillende technieken.",
                    level: "Het prototype geeft een duidelijk beeld van het gekozen onderwerp. Het prototype bevat werkende interactie met sensoren en actuatoren. AR of VR functioneert. Ontwerp en vormgeving van het prototype met toegepaste technieken sluiten op elkaar aan.",
                    above: "Je hebt veel geëxperimenteerd met het toepassen van AR, VR en microcontroller op de cube."
                }
            },
            {
                id: "BC 6.5.1",
                title: "Regelmatige reflectie met concrete lessen",
                description: "Je reflecteert regelmatig op diverse ontwerpactiviteiten en formuleert concrete lessen voor een volgende keer.",
                levels: {
                    development: "Je schrijft oppervlakkige reflecties over je ontwikkeling zonder concrete sterke of zwakke punten te benoemen. Je stelt vage leerambities zonder specifieke vaardigheden of tijdlijn. Je maakt geen concreet leerplan of actieplan voor hoe je je doelen gaat bereiken.",
                    level: "Je beschrijft tenminste 2 concrete voorbeelden. Je formuleert met behulp van een reflectiemodel een nieuw leerdoel die direct toepasbaar is voor je volgende ontwerpactiviteit. Je documenteert voor- en na vergelijkingen van hoe je eerdere lessen hebt toegepast.",
                    above: "Je reflecteert op je ontwikkeling in relatie tot trends en ontwikkelingen. Je stelt leerambities die aansluiten bij je persoonlijke doelstelling en specialisatie als ontwerper. Je ontwikkelt een leerplan dat je regelmatig evalueert en aanpast op basis van nieuwe inzichten."
                }
            }
        ]
    },
    {
        id: "6G",
        title: "Datapunt 6G: Casus Wissel Bootcamp",
        description: "Voor dit datapunt doorloop je in een week het ontwerpproces met de casusopdracht van een ander team. Op basis van de documentatie en het inzetten van AI verdiep je in de context en de wensen en behoeften van belanghebbenden.",
        deliverables: [
            "Uitwerking van de analyse van de casus met methodes en technieken",
            "Prototypes van conceptrichtingen en verantwoording van het gebruik van AI",
            "Individuele verantwoording van eigen bijdrage en het ontwerpproces"
        ],
        criteria: [
            {
                id: "BC 6.1.1",
                title: "Analyse van wensen en behoeften belanghebbenden",
                description: "Je analyseert met passende methoden wensen en behoeften van belanghebbenden in relatie tot bestaande digitale interfaces.",
                levels: {
                    development: "Je gebruikt basis onderzoeksmethoden zoals enquête of kort interview zonder onderbouwing waarom deze passend zijn. Je identificeert alleen directe gebruikers zonder bredere belanghebbenden zoals opdrachtgever of beheerders mee te nemen. Je maakt geen expliciete verbinding tussen gevonden behoeften en problemen met bestaande interfaces.",
                    level: "Je kiest bewust passende onderzoeksmethoden zoals user interviews, observatie of stakeholder mapping en verantwoordt deze keuzes. Je identificeert alle relevante belanghebbenden en analyseert hun verschillende wensen en behoeften systematisch. Je koppelt bevindingen expliciet aan specifieke problemen of kansen in bestaande digitale interfaces.",
                    above: "Je combineert meerdere onderzoeksmethoden voor betrouwbare inzichten. Je analyseert belangen tussen verschillende stakeholders en prioriteert op haalbaarheid. Je identificeert onderliggende behoeften die niet direct worden uitgesproken en vertaalt deze naar concrete verbeteringen."
                }
            },
            {
                id: "BC 6.2.1",
                title: "Experimenteren met ideation en prototyping",
                description: "Je experimenteert veelvuldig met ideation- en prototypingtechnieken om alternatieve oplossingen te verkennen van het interactie-ontwerp, de gebruikerservaringen en de vormgeving.",
                levels: {
                    development: "Je hebt enkele experimenten uitgevoerd. Je bent met 1 oplossing aan de slag gegaan.",
                    level: "Je laat een aantal relevante experimenten zien op gebied van interactie, gebruikerservaring en vormgeving. Je legt hierbij kort, bondig en navolgbaar uit: wat heb je gedaan, hoe heb je het aangepakt, wat was de conclusie en wat neem je mee in jouw ontwerp.",
                    above: "Je experimenteert uitgebreid en effectief met diverse ideation- en prototypingtechnieken om alternatieve oplossingen te verkennen. Je onderzoekt verschillende benaderingen van interactie-ontwerp, gebruikerservaringen en vormgeving, en past deze inzichten consequent toe."
                }
            },
            {
                id: "BC 6.3.1",
                title: "Tonen ontwerpproces met divergeren en convergeren",
                description: "Je toont hoe jij je ontwerpproces hebt doorlopen en hoe jij door middel van divergeren en convergeren een gericht antwoord hebt gezocht voor je ontwerpvraag.",
                levels: {
                    development: "Je documenteert minimaal je ontwerpstappen zonder duidelijke structuur of logische volgorde. Je toont geen bewuste momenten van divergeren en convergeren of springt willekeurig tussen breed en smal denken. Je legt geen verband tussen je ontwerpproces en hoe dit heeft geleid tot je uiteindelijke antwoord.",
                    level: "Je formuleert samen met jouw team een ontwerpvraag volgens aangereikte methode in de propedeuse. Je laat zien hoe jij met jouw team het ontwerpproces doorlopen hebt. Je maakt duidelijk wat hierin jouw aandeel was. Je zet methodes in om tot een hoeveelheid oplossingsrichtingen te komen. Je laat de gemaakte stappen zien om tot een gericht antwoord te komen.",
                    above: "Je visualiseert je complete ontwerpproces inclusief iteraties, terugkoppelingen en beslismomenten. Je analyseert wanneer en waarom je kiest voor divergeren of convergeren in verschillende fases. Je reflecteert kritisch op de effectiviteit van je gekozen proces en formuleert verbeteringen voor toekomstige projecten."
                }
            }
        ]
    },
    {
        id: "6H",
        title: "Datapunt 6H: Conceptvisualisatie",
        description: "Je werkt een aangescherpte oplossingsrichting uit tot een visualisatie, zoals een storyboard, infographic of videopitch.",
        deliverables: [
            "Conceptvisualisatie zoals poster, video of interactieve demo",
            "Koppeling met inzichten uit eerdere fases",
            "Verantwoording van conceptkeuzes",
            "Documentatie van teamafspraken en rolverdelingen"
        ],
        criteria: [
            {
                id: "BC 6.1.2",
                title: "Verantwoording ontwerpproces",
                description: "Je legt uit waarom jouw ontwerpproces aansluit bij de specifieke wensen en behoeften van belanghebbenden.",
                levels: {
                    development: "Er is geen link tussen het ontwerp en de criteria. De link tussen de ingezette methodes en technieken en de doelgroep of belanghebbenden ontbreekt.",
                    level: "Je laat zien hoe je de wensen en behoeftes uit 6.1.1 hebt vertaald naar ontwerpcriteria. Je laat duidelijk zien hoe jouw ontwerp voldoet aan de ontwerpcriteria. Welke methodische aanpak zet je in en je legt uit waarom deze methodes passend zijn. Je hebt de juiste stappen ondernomen die aansluiten bij het doel en de subdoelen.",
                    above: "Je maakt visueel hoe je de link hebt gemaakt tussen ontwerp en ontwerpcriteria. Je legt duidelijk en overtuigend uit hoe en waarom jouw ontwerpproces aansluit bij de specifieke wensen en behoeften van de belanghebbenden."
                }
            },
            {
                id: "BC 6.3.2",
                title: "Doel- en doelgroepgerichte verantwoording",
                description: "Je verantwoordt, doel- en doelgroepgericht, je keuzes en ontwerpresultaten.",
                levels: {
                    development: "Je geeft algemene redenen voor je keuzes zonder specifieke verbinding naar doel of doelgroep. Je baseert verantwoordingen op persoonlijke voorkeur zoals 'ik vond het mooi' in plaats van objectieve criteria. Je toont geen duidelijke link tussen je ontwerpkeuzes en de behoeften van je specifieke doelgroep.",
                    level: "Je verantwoordt elke belangrijke keuze met concrete verwijzingen naar projectdoel en doelgroepbehoeften. Je onderbouwt beslissingen met onderzoek zoals user research, benchmarks of literatuur en design principes. Je laat zien hoe je keuzes specifiek bijdragen aan het oplossen van het probleem voor je doelgroep.",
                    above: "Alle ontwerpkeuzes zijn helder en consistent verantwoord. Je koppelt keuzes aan meetbare criteria en toont aan waarom je oplossing optimaal is voor doel en doelgroep. Je anticipeert op kritische vragen en bereidt sterke argumenten voor die je standpunten ondersteunen."
                }
            }
        ]
    }
];
