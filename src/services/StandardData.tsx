import ISkill from '../models/skill.model';
import ISkilltree from '../models/skilltree.model';
import {v4 as uuid} from "uuid"; 

export const standardTheme  = {
    backgroundColor: 'transparent',
    border: '2px solid white',
    borderRadius: '4px',
    primaryFont: 'Nunito',
    primaryFontColor: 'white',
    treeBackgroundColor: 'rgba(0, 0, 0, .6)',
    headingFont: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
    headingFontColor: 'white',
    headingFontSize: '24px',
    headingHoverColor: 'rgba(0, 0, 0, .6)',
    headingHoverColorTransition: 'background 0.3s ease-out',
    tooltipBackgroundColor: 'white',
    tooltipFontColor: '#16181c',
    tooltipZIndex: 99999,
    nodeBackgroundColor: '#282c34',
    nodeBorderColor: 'white',
    nodeAlternativeFontColor: 'white',
    nodeAltenativeActiveFontColor: 'white',
    nodeOverlayColor: 'white',
    nodeAlternativeActiveBackgroundColor: `
    linear-gradient(
      to right,
      #b9e562 0%,
      #41e2bd 50%,
      #c284d8 100%
    )`,
    nodeActiveBackgroundColor: `linear-gradient(
        to right,
        #b9e562 0%,
        #41e2bd 50%,
        #c284d8 100%
      )`,
    nodeHoverBorder: '4px solid',
    nodeHoverBorderColor: `linear-gradient(
        to right,
        #b9e562 0%,
        #41e2bd 50%,
        #c284d8 100%
      )`,
    nodeIconWidth: '64px',
    nodeMobileTextNodeHeight: '32px',
    nodeMobileTextNodeWidth: '108px',
    nodeMobileFontSize: '14px',
    nodeDesktopTextNodeHeight: '28px',
    nodeDesktopTextNodeWidth: '144px',
    nodeDesktopFontSize: '16px',
    edgeBorder: '1px solid white',
  }

export const standardData = [
    {
      id: 'hello-world',
      title: 'Hello World',
      tooltip: {
        description:
          'This node is the top most level, and will be unlocked, and ready to be clicked.',
        links: []
      },
      children: [
        {
          id: 'hello-sun',
          title: 'Hello Sun',
          tooltip: {
            description:
              'This is a child of the top node, and will be locked while the parent isn’t in a selected state.',
            links: [{
                id: 0,
                reference: 'https://youtube.com', 
                title: 'Link to YouYube', 
                iconName: 'youtube-square',
                iconPrefix: 'fab'
            }]
          },
          children: [],
        },
        {
          id: 'hello-stars',
          title: 'Hello Stars',
          tooltip: {
            description:
              'This is the child of ‘Hello World and the sibling of ‘Hello Sun’. Notice how the app takes care of the layout automatically?',
            links: []
          },
          children: [],
        },
      ],
    },
  ];

  export const standardEmptySkill : ISkill = {
    title: '',
    description: '',
    order: 0,
    links: [],
    optional: false,
    direction: 'top',
    countChildren: 0
  } 

  export const standardRootSkill : ISkill = {
    title: 'Hello World',
    description: 'This node is the top most level, and will be unlocked, and ready to be clicked.',
    order: 0,
    links: [],
    optional: false,
    direction: 'top',
    countChildren: 2
  } 
  
  export const standardChildSkills: ISkill[] = [
    {
      title: 'Hello Sun',
      description:
          'This is a child of the top node, and will be locked while the parent isn’t in a selected state.',
      links: [{
            id: uuid(),
            reference: 'https://youtube.com', 
            title: 'Link to YouYube', 
            iconName: 'youtube-square',
            iconPrefix: 'fab'
        }],
      order: 0,
      optional: false,
      direction: 'top',
      countChildren: 0
    },
    {
      title: 'Hello Stars',
      description:
          'This is the child of ‘Hello World and the sibling of ‘Hello Sun’. Notice how the app takes care of the layout automatically?',
      links: [],
      order: 1,
      optional: false,
      direction: 'top',
      countChildren: 0
    }
  ];

  export const linkIcons = {
    'youtube': 
      {
        icon: 'youtube-square',
        iconLibrary: 'fab'
      },
    'link': {
        icon: 'link',
        iconLibrary: 'fas'
    },
    'file': {
        icon: 'file',
        iconLibrary: 'fas'
    }
  }

  export const standardSkilltree : ISkilltree = {
    collapsible: true,
    data: standardData,
    description: "More information about my skill tree",
    id: 'default-skilltree',
    title: 'Example',
    order: 0,
  }

  const cssColors = [
    "AliceBlue",
    "AntiqueWhite",
    "Aqua",
    "Aquamarine",
    "Azure",
    "Beige",
    "Bisque",
    "Black",
    "BlanchedAlmond",
    "Blue",
    "BlueViolet",
    "Brown",
    "BurlyWood",
    "CadetBlue",
    "Chartreuse",
    "Chocolate",
    "Coral",
    "CornflowerBlue",
    "Cornsilk",
    "Crimson",
    "Cyan",
    "DarkBlue",
    "DarkCyan",
    "DarkGoldenRod",
    "DarkGray",
    "DarkGrey",
    "DarkGreen",
    "DarkKhaki",
    "DarkMagenta",
    "DarkOliveGreen",
    "DarkOrange",
    "DarkOrchid",
    "DarkRed",
    "DarkSalmon",
    "DarkSeaGreen",
    "DarkSlateBlue",
    "DarkSlateGray",
    "DarkSlateGrey",
    "DarkTurquoise",
    "DarkViolet",
    "DeepPink",
    "DeepSkyBlue",
    "DimGray",
    "DimGrey",
    "DodgerBlue",
    "FireBrick",
    "FloralWhite",
    "ForestGreen",
    "Fuchsia",
    "Gainsboro",
    "GhostWhite",
    "Gold",
    "GoldenRod",
    "Gray",
    "Grey",
    "Green",
    "GreenYellow",
    "HoneyDew",
    "HotPink",
    "IndianRed",
    "Indigo",
    "Ivory",
    "Khaki",
    "Lavender",
    "LavenderBlush",
    "LawnGreen",
    "LemonChiffon",
    "LightBlue",
    "LightCoral",
    "LightCyan",
    "LightGoldenRodYellow",
    "LightGray",
    "LightGrey",
    "LightGreen",
    "LightPink",
    "LightSalmon",
    "LightSeaGreen",
    "LightSkyBlue",
    "LightSlateGray",
    "LightSlateGrey",
    "LightSteelBlue",
    "LightYellow",
    "Lime",
    "LimeGreen",
    "Linen",
    "Magenta",
    "Maroon",
    "MediumAquaMarine",
    "MediumBlue",
    "MediumOrchid",
    "MediumPurple",
    "MediumSeaGreen",
    "MediumSlateBlue",
    "MediumSpringGreen",
    "MediumTurquoise",
    "MediumVioletRed",
    "MidnightBlue",
    "MintCream",
    "MistyRose",
    "Moccasin",
    "NavajoWhite",
    "Navy",
    "OldLace",
    "Olive",
    "OliveDrab",
    "Orange",
    "OrangeRed",
    "Orchid",
    "PaleGoldenRod",
    "PaleGreen",
    "PaleTurquoise",
    "PaleVioletRed",
    "PapayaWhip",
    "PeachPuff",
    "Peru",
    "Pink",
    "Plum",
    "PowderBlue",
    "Purple",
    "RebeccaPurple",
    "Red",
    "RosyBrown",
    "RoyalBlue",
    "SaddleBrown",
    "Salmon",
    "SandyBrown",
    "SeaGreen",
    "SeaShell",
    "Sienna",
    "Silver",
    "SkyBlue",
    "SlateBlue",
    "SlateGray",
    "SlateGrey",
    "Snow",
    "SpringGreen",
    "SteelBlue",
    "Tan",
    "Teal",
    "Thistle",
    "Tomato",
    "Turquoise",
    "Violet",
    "Wheat",
    "White",
    "WhiteSmoke",
    "Yellow",
    "YellowGreen",
  ]
const colors : any[] = []; 
cssColors.forEach(color => {
    colors.push({value: color.toLocaleLowerCase(), title: color})
});

export const allColors = colors;

export const gradients = [{value: "linear-gradient(to right, #59c173, #a17fe0, #5d26c1)", title:"Magic"},
        {value: "linear-gradient(to right, #b9e562 0%, #41e2bd 50%, #c284d8 100%)", title: "Rainbow"},
        {value: "linear-gradient(to right, #a8c0ff, #3f2b96)", title: "Ocean View"},
        {value: "linear-gradient(to right, #333333, #dd1818)", title: "Pure Lust"},
        {value: "linear-gradient(to right, #4e54c8, #8f94fb)", title: "Moon Purple"},
        {value: "linear-gradient(to right, #355c7d, #6c5b7b, #c06c84)", title:"Red Sunset"},
        {value: "linear-gradient(to right, #40e0d0, #ff8c00, #ff0080)", title: "Wedding Day Blues"},
        {value: "linear-gradient(to right, #3e5151, #decba4)", title: "Sand to Blue"},
        {value: "linear-gradient(to right, #283048, #859398)", title: "Titanium"},
        {value: "linear-gradient(to right, #232526, #414345)", title: "Midnight City"},
        {value: "linear-gradient(to right, #ff512f, #dd2476)", title: "Bloody Mary"}];

export const treebeardTheme =  {
  tree: {
      base: {
          listStyle: 'none',
          backgroundColor: 'white',
          margin: 0,
          padding: 0,
          color: '0xFF',
          fontFamily: 'nunito, lucida grande ,tahoma,verdana,arial,sans-serif',
          fontSize: '16px'
      },
      node: {
          base: {
              position: 'relative'
          },
          link: {
              cursor: 'pointer',
              position: 'relative',
              padding: '0px 5px',
              display: 'block'
          },
          activeLink: {
              background: '#eff0eb'
          },
          toggle: {
              base: {
                  position: 'relative',
                  display: 'inline-block',
                  verticalAlign: 'top',
                  marginLeft: '-5px',
                  height: '24px',
                  width: '24px'
              },
              wrapper: {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  margin: '-7px 0 0 -7px',
                  height: '14px'
              },
              height: 14,
              width: 14,
              arrow: {
                  fill: '#fa7c91',
                  strokeWidth: 0
              }
          },
          header: {
              base: {
                  display: 'inline-block',
                  verticalAlign: 'top',
                  color: '#363a3d'
              },
              connector: {
                  width: '2px',
                  height: '12px',
                  borderLeft: 'solid 2px black',
                  borderBottom: 'solid 2px black',
                  position: 'absolute',
                  top: '0px',
                  left: '-21px'
              },
              title: {
                  lineHeight: '24px',
                  verticalAlign: 'middle'
              }
          },
          subtree: {
              listStyle: 'none',
              paddingLeft: '19px'
          },
          loading: {
              color: '#E2C089'
          }
      }
  }
};

export const toolbarConfig = {
  // Optionally specify the groups to display (displayed in the order listed).
  display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'LINK_BUTTONS', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
  INLINE_STYLE_BUTTONS: [
    {label: 'Bold', style: 'BOLD', className: 'custom-css-class'},
    {label: 'Italic', style: 'ITALIC'},
    {label: 'Underline', style: 'UNDERLINE'}
  ],
  LINK_BUTTONS: [
      {label: 'Link'},
      {label: 'Unlink'}
      ],
  BLOCK_TYPE_DROPDOWN: [
    {label: 'Normal', style: 'unstyled'},
    {label: 'Heading Large', style: 'header-one'},
    {label: 'Heading Medium', style: 'header-two'},
    {label: 'Heading Small', style: 'header-three'}
  ],
  BLOCK_TYPE_BUTTONS: [
    {label: 'UL', style: 'unordered-list-item'},
    {label: 'OL', style: 'ordered-list-item'}
  ]
};

export const quizImage = 'https://cdn.pixabay.com/photo/2017/02/11/22/41/quiz-2058888_1280.png';

export const iconImages = [
  {
    title: "Visual arts",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon-bv.png?alt=media&token=769bbbec-e96f-4972-aa45-9dad53e3e201",
    category: 'Education'
  },
  {
    title: "Geography",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_ak.png?alt=media&token=c22b8b22-b623-4819-84fe-cca812130091",
    category: 'Education'
  },
  {
    title: "Biology",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_bi.png?alt=media&token=e6337e85-5a81-48a7-afdd-7034c19aa5aa",
    category: 'Education'
  },
  {
    title: "First aid",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_EHBO.png?alt=media&token=c8c98bf2-88c0-44e6-8529-bf6655124b2c",
    category: 'Education'
  },
  {
    title: "Germany",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_du.png?alt=media&token=33f10fbf-db78-467b-9716-fcd2bf24c56b",
    category: 'Education'
  },
  {
    title: "Economics",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_ec%20.png?alt=media&token=9604b2fe-5092-491e-ba0f-b30420fe9ca1",
    category: 'Education'
  },
  {
    title: "England",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_en.png?alt=media&token=71a7ca54-c62f-40d8-9011-b08da9a908a5",
    category: 'Education'
  },
  {
    title: "Events and sports",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_ev.png?alt=media&token=bd21063e-7793-4e3e-a027-2c708765caf3",
    category: 'Education'
  },
  {
    title: "France",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_fa.png?alt=media&token=30beb38b-8789-4006-a806-4f4961a711c4",
    category: 'Education'
  },
  {
    title: "History",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_gs.png?alt=media&token=4ad97f98-79b3-4d4c-b7b7-0046f8a38cc2",
    category: 'Education'
  },
  {
    title: "ICT",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_ict.png?alt=media&token=33231897-6942-4636-b154-af7acbb28252",
    category: 'Education'
  },
  {
    title: "Physical education",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_lo.png?alt=media&token=de6b959c-1ea2-4a61-97f9-8e5576d5e649",
    category: 'Education'
  },
  {
    title: "Career orientation",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_lob.png?alt=media&token=8994d1de-3390-4771-af42-985803650ffa",
    category: 'Education'
  },
  {
    title: "Mentoring",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_men.png?alt=media&token=f60a97db-3c2e-4da5-8d1a-2ba0ce64320a",
    category: 'Education'
  },
  {
    title: "Social science",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_mk.png?alt=media&token=10e608fb-3c9f-48bf-be60-45888c402918",
    category: 'Education'
  },
  {
    title: "Civics",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_ml.png?alt=media&token=e5edc2f3-6e0f-4c54-bb1d-8c26e6df6955",
    category: 'Education'
  },
  {
    title: "Physics",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_na.png?alt=media&token=ef7b5e88-9ebd-4108-9637-0e98912cc5b2",
    category: 'Education'
  },
  {
    title: "Science",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_nask.png?alt=media&token=f31b95fc-f754-4edd-8ed5-ed9965e60f1d",
    category: 'Education'
  },
  {
    title: "Netherlands",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_ne.png?alt=media&token=2276fa86-92fe-4317-90f5-29cdb7c86224",
    category: 'Education'
  },
  {
    title: "Assignment",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_pws.png?alt=media&token=3068704d-c0e4-43d6-8dcb-2d060dee559f",
    category: 'Education'
  },
  {
    title: "Calculate",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_rek.png?alt=media&token=c1807ec4-7966-4077-9441-0240cbe61817",
    category: 'Education'
  },
  {
    title: "Robotics",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_ro.png?alt=media&token=6564d712-2ed8-48cf-b99c-f1e9cda6cc68",
    category: 'Education'
  },
  {
    title: "Chemistry",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_sk.png?alt=media&token=c1030132-aac7-4c57-ace0-82b06c65b294",
    category: 'Education'
  },
  {
    title: "Social skills",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_sova.png?alt=media&token=dae0b7e6-b230-43ed-98cf-90ccd94b88ea",
    category: 'Education'
  },
  {
    title: "Web shop",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_web.png?alt=media&token=29099cce-7033-401f-93c5-36e0bb02ae14",
    category: 'Education'
  },
  {
    title: "Mathematics",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_wi.png?alt=media&token=6ad8b0db-b2c0-48b9-96f2-9915fdfb78e4",
    category: 'Education'
  },
  {
    title: "Health",
    link: "https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/icons%2Ficons_recon_zw.png?alt=media&token=e1cca1f8-cc3f-4067-a68f-f8cd57f4d14a",
    category: 'Education'
  }
]