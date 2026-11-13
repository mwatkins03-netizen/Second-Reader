/* Second Reader · content
   Everything a non-coder would want to change lives in this file: sample documents, checks, rubric bands, images.
   Every sample application and report below is FICTIONAL, written for this demonstration. The organizations and
   people are invented. The counties are real. Rubric criterion names and point ranges follow the South Carolina
   Arts Commission's published FY27 guidelines; the band descriptions are paraphrased, not the official wording. */

window.SR = {

  sources: {
    aoc: { label: "Art of Community: Rural SC guidelines", url: "https://www.southcarolinaarts.com/grant/aoc/" },
    flk: { label: "Folklife & Traditional Arts Project Grant guidelines", url: "https://www.southcarolinaarts.com/grant/flk/" },
    plan: { label: "SCAC strategic plan, 2025 to 2030", url: "https://www.southcarolinaarts.com/about-the-scac/strategicplan/" },
    reports: { label: "SCAC final reports page", url: "https://www.southcarolinaarts.com/all-grants/final-reports/" },
    retrieved: "November 13, 2026"
  },

  /* ---------- 01 Intake ---------- */
  intake: {
    checks: [
      { id: "rural", label: "Serves the applicant's own rural community", expect: "yes",
        ask: "Does the application describe a project that serves the rural South Carolina community where the applicant is located?" },
      { id: "public", label: "Has a public engagement component", expect: "yes",
        ask: "Does the application include a public engagement component, meaning an event or activity open to the public?" },
      { id: "steering", label: "Names a steering committee to lead it", expect: "yes",
        ask: "Does the application name a project steering committee, a group of people who will lead the project?" },
      { id: "discipline", label: "Supports an artistic discipline", expect: "yes",
        ask: "Does the project clearly support at least one artistic discipline such as music, dance, theatre, visual arts, crafts, literature, media arts, public art, or folklife and traditional arts?" },
      { id: "applicant", label: "Applicant is a school, district, or individual artist", expect: "no",
        ask: "Is the applicant itself a school, a school district, or an individual artist, as opposed to a nonprofit, library, college, or unit of government?" },
      { id: "fundraising", label: "Activity is mainly a fundraiser", expect: "no",
        ask: "Are the proposed activities primarily intended to raise money for the applicant or another cause?" },
      { id: "resale", label: "Asks for construction or goods for resale", expect: "no",
        ask: "Does the budget ask grant funds to pay for new construction or for goods that will be sold?" },
      { id: "amount", label: "Requests more than $5,000", expect: "no",
        ask: "Does the application request more than $5,000 from the grant?" }
    ],
    samples: [
      { id: "porch", title: "Porch Stories", org: "Friends of the Ashwood Branch Library", county: "Lee County",
        text: `Applicant: Friends of the Ashwood Branch Library, a nonprofit registered with the S.C. Secretary of State, Lee County.
Request: $4,200 from Art of Community: Rural SC.

Project: Porch Stories. Over ten weeks, storyteller and banjo player Lorene Tisdale will lead six free evening workshops at the Ashwood branch, where residents record a family story and set it to music. The series closes with a free public performance and listening party on the library lawn on May 9, open to anyone in the county.

Why here: Ashwood has no performance venue and the nearest arts programming is a forty minute drive. The library is the one public building open after five.

Steering committee: Branch manager Delia Frierson (chair), Rev. Amos Pringle of Mt. Carmel AME, Lee County 4-H agent Ruth Kennerly, retired band director Howard Sams, and high school senior Tasha Bell. The committee sets the schedule and budget and will meet every two weeks.

Budget: artist fees $2,700; recording equipment rental $650; printed programs and flyers $350; lawn chairs and sound rental for the performance $500. Match of $2,100 from the Friends' book sale fund and county library in-kind space.` },
      { id: "gala", title: "Harvest Moon Gala", org: "Cotton Row Heritage Guild", county: "Marlboro County",
        text: `Applicant: Cotton Row Heritage Guild, nonprofit, Marlboro County.
Request: $7,500.

Project: The Harvest Moon Gala is our signature evening of the year. Tickets are $85 per person and all proceeds go to the Guild's building fund so that we can add a new wing to the depot museum. A jazz trio from Charlotte will play during dinner and we will hold a silent auction.

We will also use grant funds to order 400 printed tote bags and a run of framed prints of the depot, which will be sold at the gala and in our gift shop through the holidays.

Our board president will make all decisions about the event as she has for the past nine years.

Budget: jazz trio $1,800; catering deposit $2,400; tote bags and framed prints for sale $1,900; lumber and framing for the new wing $1,400.` },
      { id: "mural", title: "Depot Wall Mural", org: "Town of Ridge Spring Crossing", county: "Saluda County",
        text: `Applicant: Town of Ridge Spring Crossing, a unit of local government, Saluda County.
Request: $5,000.

Project: A mural on the north wall of the old peach packing shed downtown. Muralist Dev Okafor will hold two design sessions at the town hall, then paint over three weekends in April. A few of us on council and at the merchants' group will guide the work. Students from the elementary school art club will help paint the lower band on one Saturday.

When it is finished we expect to have some kind of unveiling, date to be decided, and may sell postcards of the mural at the peach festival to help with upkeep.

Budget: artist fee $3,400; paint, primer, and lift rental $1,250; design session supplies $350. The town will match with $1,500 cash and public works labor.` }
    ]
  },

  /* ---------- 02 Panel ---------- */
  panel: {
    note: "Six of the criteria from the FY27 Folklife & Traditional Arts rubric. Band descriptions are paraphrased.",
    criteria: [
      { id: "community", label: "Cultural Community", points: ["0 to 2", "3 to 5", "6 to 8", "9 to 10"],
        ask: "How clearly and specifically does the application represent a cultural community or group?",
        bands: ["No cultural community is represented, or the language is generic or inaccurate.",
                "A community is mentioned, but the picture is broad or unclear.",
                "A community is represented with clarity, understanding, and relevance.",
                "A community is represented specifically, with strong understanding and clear relevance."] },
      { id: "tradition", label: "Art Form Traditionality", points: ["0 to 2", "3 to 5", "6 to 8", "9 to 10"],
        ask: "How traditional is the art form, meaning passed down within a group through lineage, occupation, religious or ethnic connection, or another shared identity?",
        bands: ["The art form is not traditional, or tradition is described inaccurately.",
                "Tradition is mentioned, but the lineage or shared identity behind it is vague.",
                "The art form is traditional through lineage, occupation, faith, ethnicity, or another shared identity.",
                "The art form is strongly traditional, with a direct and stated line of transmission."] },
      { id: "practitioner", label: "Practitioner Experience", points: ["0 to 2", "3 to 4", "5 to 6", "7 to 8"],
        ask: "How well does the application show that the artists are recognized by their cultural community as practitioners of the traditional art form?",
        bands: ["Artists are not recognized practitioners, or biographies are missing or unrelated.",
                "Artists have limited recognition; biographies connect only loosely to the art form.",
                "Artists are recognized practitioners; biographies tie their experience to the art form.",
                "Artists are highly recognized and experienced; biographies are specific and establish that standing."] },
      { id: "significance", label: "Cultural Significance", points: ["0 to 1", "2 to 3", "4 to 5", "6 to 7"],
        ask: "How well does the application show that the art form is significant within the identified cultural community?",
        bands: ["No significance within the community is shown.",
                "Slight significance, supported with vague or loosely connected information.",
                "Significant, supported with relevant and accurate information that lacks depth.",
                "Deeply significant, tied to the art form's function and history in the community."] },
      { id: "goals", label: "Project Goals", points: ["0 to 2", "3 to 5", "6 to 9", "10 to 12"],
        ask: "How clear, aligned, and achievable are the project goals and their expected outcomes?",
        bands: ["Goals are missing or have no expected outcomes.",
                "Goals are vague and only partly achievable; outcomes are broad.",
                "Goals are outlined, fit the project, and are achievable, with matching outcomes.",
                "Goals are distinct and highly achievable, with thoroughly detailed outcomes."] },
      { id: "measures", label: "Success Measurements", points: ["0 to 1", "2 to 3", "4 to 5", "6 to 7"],
        ask: "How strong is the plan to collect data and measure whether the project met its goals?",
        bands: ["No plan to collect relevant data.",
                "A vague plan to collect data.",
                "A plan that includes audience numbers and expected outcomes.",
                "A detailed plan covering audience numbers, outcomes, and future community need."] }
    ],
    samples: [
      { id: "nets", title: "Cast Net Apprenticeship", org: "Coosaw Landing Community Association", county: "Hampton County",
        text: `Applicant: Coosaw Landing Community Association, Hampton County. Request: $6,000.

Community and art form: Hand-knit cast nets have been made by Gullah Geechee families along the Coosawhatchie and Combahee for generations. Men and women in our community learned to knit mullet and shrimp nets from parents and grandparents using a palmetto-wood needle and a gauge block, sizing the mesh by the catch and the season. A net is a working tool and also a gift at weddings and when a boy first goes out on the river. Fewer than six people in Coosaw Landing still knit a full net by hand.

Practitioners: Master net maker Josiah Brantley, 78, learned from his grandfather at age nine and has supplied nets to river families for six decades. He was featured in the 2019 Lowcountry maritime traditions exhibit and teaches at the Coosaw homecoming each August. His niece, Marva Brantley Singleton, has knitted alongside him for twenty years and will co-teach.

Project: A nine-month apprenticeship pairing Mr. Brantley and Mrs. Singleton with four apprentices aged 16 to 30 from Coosaw Landing families. Apprentices meet twice a month from September to May and each completes one six-foot net.

Goals and outcomes: (1) Four apprentices each finish a net and can cut a needle and set a mesh without help. (2) Record ten hours of Mr. Brantley describing terms, knots, and river practice, deposited with the county library. (3) A public demonstration and blessing of the nets at the May river day, expected attendance 200.

Measuring success: Attendance log at each session; a skills checklist signed by both teachers at months three, six, and nine; a head count and short card survey at river day asking who wants to learn next year; a count of households requesting nets.` },
      { id: "heritage", title: "Heritage Days", org: "Broad River Historical Society", county: "Union County",
        text: `Applicant: Broad River Historical Society, Union County. Request: $6,000.

Our Heritage Days weekend celebrates the rich culture and traditions of our area. Visitors will step back in time and experience how pioneers lived. Volunteers in period dress will re-create a frontier homestead with candle dipping, a blacksmith display, and a militia encampment.

On Saturday night we will present a bluegrass concert featuring a popular regional touring band. Bluegrass has always been part of the South. We also plan to have craft vendors and food trucks.

The society's events chair has organized many successful events. The band has thousands of followers online.

Our goal is to bring people together and raise awareness of heritage. We expect a good crowd and will know it was a success by how many people come.` }
    ]
  },

  /* ---------- 03 Reports ---------- */
  reports: {
    questions: [
      { id: "k12", label: "Reached K-12 students", ask: "Does the report say that school-age children or teenagers (kindergarten through grade 12) took part?" },
      { id: "rural", label: "Served a rural community", ask: "Does the report describe activity in a rural community or small town?" },
      { id: "numbers", label: "Gives attendance numbers", ask: "Does the report state a specific number of participants or audience members?" },
      { id: "artists", label: "Paid artists", ask: "Does the report say that artists or teaching artists were paid?" },
      { id: "outcome", label: "Names a measured outcome", ask: "Does the report describe an outcome that was measured, beyond attendance alone?" },
      { id: "access", label: "Mentions accessibility", ask: "Does the report mention any accessibility accommodation, such as interpretation, captioning, large print, or physical access?" }
    ],
    items: [
      { id: "r1", org: "Edisto Fork Arts Council", county: "Bamberg", grant: "Art of Community",
        text: "We held eight Saturday clay workshops at the old depot in Ehrhardt, population 500. 61 residents took part across the series, and we paid potter Nan Coker and one assistant. A sign language interpreter attended the final open house. On exit cards, 44 of 52 respondents said it was their first arts class as an adult." },
      { id: "r2", org: "Upstate Youth Strings", county: "Greenville", grant: "School Arts Support",
        text: "Funds bought twelve violins and four cellos for the after-school program at two middle schools. 86 students in grades six through eight now have an instrument to take home. Our two teaching artists were paid from other funds. Students who stayed the full year improved an average of one level on the district playing assessment." },
      { id: "r3", org: "Pee Dee Blues Society", county: "Florence", grant: "Festivals",
        text: "The festival was a wonderful success and the community response was tremendous. Everyone had a great time and many people told us it was the best year yet. We are grateful for the support and look forward to next year." },
      { id: "r4", org: "Friends of Lake Marion Library", county: "Clarendon", grant: "Art of Community",
        text: "Poet-in-residence Camille Ward led a six-week memoir circle at the Summerton branch for older adults. Twelve people finished and read at a public evening that drew about 70. The artist received a stipend. Large-print copies of the chapbook were made, and the branch added a ramp to the reading room this year." },
      { id: "r5", org: "Catawba Valley Clay Guild", county: "York", grant: "Folklife & Traditional Arts",
        text: "Two Catawba potters demonstrated pit firing at three public events and were paid a daily fee. We did not count visitors at the outdoor events. A fourth-grade class visited one demonstration as a field trip." },
      { id: "r6", org: "Lowcountry Dance Lab", county: "Charleston", grant: "Arts Project Support",
        text: "The grant paid for a new marley floor and a lighting board for our studio theater downtown. No programs were held with these funds during the grant period. The equipment will be used next season." },
      { id: "r7", org: "Allendale Alive", county: "Allendale", grant: "Art of Community",
        text: "Muralist Terrence Odom worked with the high school art class and town volunteers to paint the water-street wall in Fairfax. 23 students and 40 adult volunteers painted. A before and after survey of downtown merchants found five of eight reporting more foot traffic. The artist and two student assistants were paid." },
      { id: "r8", org: "Midlands Theatre Access Project", county: "Richland", grant: "Accessibility",
        text: "We added open captioning to nine performances and audio description to four. 212 patrons used a captioned or described performance, up from 0 the prior season. Captioners and describers were contracted professionals. We tracked seat requests by accommodation type." }
    ]
  },

  /* ---------- 04 Coach ---------- */
  coach: {
    note: "Five criteria from the FY27 Art of Community rubric. Band descriptions and advice are paraphrased and written for this demo.",
    criteria: [
      { id: "challenges", label: "Community Challenges",
        ask: "How thoroughly does the draft identify and detail the community's biggest challenges?",
        bands: ["Challenges are not named.", "Challenges are named with little detail.", "Challenges are clearly named and detailed.", "Challenges are thoroughly named and strongly detailed."],
        next: ["Name one challenge your neighbors would recognize, in a plain sentence.", "Add a detail only someone local would know: a number, a place, a date something closed.", "Show how the challenges connect to each other and who feels them most.", ""] },
      { id: "addressed", label: "Challenge Addressed",
        ask: "How clearly does the draft identify the specific challenge this project will address, and show understanding of local impact?",
        bands: ["No specific challenge is tied to the project.", "A challenge is loosely tied to the project.", "A specific challenge is tied to the project with a general sense of local impact.", "A specific challenge is tied to the project with a strong grasp of local impact."],
        next: ["Say which single challenge this project takes on.", "Explain what will be different locally if the project works.", "Describe who is affected and how you will know it changed for them.", ""] },
      { id: "arts", label: "Use of Arts and Culture",
        ask: "How central are arts and culture to the project, and how many concrete examples does the draft give of art addressing the challenge?",
        bands: ["Arts and culture are barely part of the project.", "Arts matter somewhat; a few thin examples.", "Arts are clearly important; several concrete examples.", "Arts are essential; five or more strong examples."],
        next: ["Put the art form and the artist in the first paragraph.", "List each arts activity separately and say what it does about the challenge.", "Reach five specific examples, each with who, what, and where.", ""] },
      { id: "importance", label: "Project Importance",
        ask: "How well does the draft explain why the project matters to the community or the applicant, with specific supporting details?",
        bands: ["Little or no explanation of why it matters.", "Somewhat important, without specifics.", "Clearly important, with two or three supporting details.", "Vital, with several strong supporting details."],
        next: ["Finish the sentence: without this project, our town will keep...", "Add two details that are specific to this project and place.", "Add evidence someone else supplied: a letter, a survey, a waiting list.", ""] },
      { id: "marketing", label: "Audience and Marketing",
        ask: "How clearly does the draft specify the audience and a marketing plan that will reach that audience?",
        bands: ["No audience or plan.", "A general audience and a loosely defined plan.", "A named audience and a clear plan aimed at it.", "A precisely named audience and a thorough, well-targeted plan."],
        next: ["Say who you most want in the room.", "Name the two or three channels those people already use.", "Add dates, a person responsible, and how you will reach people without internet.", ""] }
    ],
    samples: [
      { id: "first", title: "A first draft",
        text: "Our town needs more arts. There is not much to do here and young people leave. We want to have an arts program that brings the community together and makes things better. An artist will come and do workshops and everyone is invited. We will put it on Facebook. This project is very important to our community and will have a big impact." },
      { id: "revised", title: "A revised draft",
        text: "Estill lost its only grocery store in 2023 and its last downtown restaurant the year after. The high school reports that two of every three graduates leave Hampton County within a year. With the storefronts dark, older residents told our library survey they no longer come downtown after four o'clock.\n\nThis project takes on one piece of that: there is nowhere downtown to gather in the evening. Over twelve weeks, quilter Odessa Grant and the county's 4-H photography club will turn the empty Lawton Street pharmacy window into a rotating exhibit. Residents will bring a family quilt to be photographed and recorded (1), teens will print and hang the portraits (2), Mrs. Grant will lead four open quilting bees in the window itself (3), the church choirs will sing at each monthly opening (4), and the final month's window will show a new story quilt made by all participants (5).\n\nOur audience is residents over sixty and teenagers, the two groups our survey found least likely to attend anything downtown. We will reach elders through announcements at the five largest churches and the senior meal site, with a printed card and a phone number, and teens through the 4-H club and the high school's morning announcements. Library clerk Jo Bing is responsible for the calendar and will call every registered household the week before each opening." }
    ]
  },

  /* ---------- 05 Collection ---------- */
  collection: {
    mediums: {
      basketry: "A woven or coiled basket, or basket making",
      ceramics: "Pottery, stoneware, or fired clay",
      ironwork: "Wrought iron or other metalwork",
      textile: "Quilts, cloth, or fiber work",
      other: "Something else"
    },
    images: [
      { id: "maker", title: "Sweetgrass basket maker, Charleston City Market",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Sweetgrass_Basket_Maker.jpg/250px-Sweetgrass_Basket_Maker.jpg",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Sweetgrass_Basket_Maker.jpg/960px-Sweetgrass_Basket_Maker.jpg",
        credit: "Mattstone911", license: "CC BY-SA 3.0", page: "https://commons.wikimedia.org/wiki/File:Sweetgrass_Basket_Maker.jpg",
        alt: "A woman seated at a market stall coils a sweetgrass basket, with finished baskets around her." },
      { id: "jar", title: "Storage jar by Dave Drake, 1840",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Storage_jar_by_Dave_Drake%2C_1840%2C_stoneware_-_Fogg_Museum_-_Harvard_University_-_DSC01694.jpg/250px-Storage_jar_by_Dave_Drake%2C_1840%2C_stoneware_-_Fogg_Museum_-_Harvard_University_-_DSC01694.jpg",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Storage_jar_by_Dave_Drake%2C_1840%2C_stoneware_-_Fogg_Museum_-_Harvard_University_-_DSC01694.jpg/960px-Storage_jar_by_Dave_Drake%2C_1840%2C_stoneware_-_Fogg_Museum_-_Harvard_University_-_DSC01694.jpg",
        credit: "Daderot", license: "Public domain", page: "https://commons.wikimedia.org/wiki/File:Storage_jar_by_Dave_Drake,_1840,_stoneware_-_Fogg_Museum_-_Harvard_University_-_DSC01694.jpg",
        alt: "A large brown stoneware jar." },
      { id: "gate", title: "Philip Simmons gate, 91 Anson Street, Charleston",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/91_Anson_Street_-_Philip_Simmons_Gate.JPG/250px-91_Anson_Street_-_Philip_Simmons_Gate.JPG",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/91_Anson_Street_-_Philip_Simmons_Gate.JPG/960px-91_Anson_Street_-_Philip_Simmons_Gate.JPG",
        credit: "ProfReader", license: "CC BY-SA 3.0", page: "https://commons.wikimedia.org/wiki/File:91_Anson_Street_-_Philip_Simmons_Gate.JPG",
        alt: "A gate." },
      { id: "sherds", title: "Catawba pottery, Catawba Cultural Center, Rock Hill",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Catawba_Pottery.jpg/250px-Catawba_Pottery.jpg",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Catawba_Pottery.jpg/960px-Catawba_Pottery.jpg",
        credit: "Thomas Kirchel", license: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:Catawba_Pottery.jpg",
        alt: "Pottery fragments arranged in a display case." },
      { id: "market", title: "Sweetgrass baskets at the market, Charleston",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/US-charleston-sweetgrass-b.jpg/250px-US-charleston-sweetgrass-b.jpg",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/US-charleston-sweetgrass-b.jpg/960px-US-charleston-sweetgrass-b.jpg",
        credit: "Balou46", license: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:US-charleston-sweetgrass-b.jpg",
        alt: "Many coiled sweetgrass baskets of different sizes laid out on a market table." }
    ]
  }
};
