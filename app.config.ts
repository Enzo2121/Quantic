export default defineAppConfig({
  icon: {
    size: '', // default <Icon> size applied
    class: '', // default <Icon> class applied
  },
  sidebar: {
    collapsible: 'offcanvas', // 'offcanvas' | 'icon' | 'none'
    side: 'left', // 'left' | 'right'
    variant: 'sidebar', // 'sidebar' | 'floating' | 'inset'
  },
  theme: {
    primary: '#5f259f',
    name: 'violet',
    radius: '0.5',
  },
  typography: {
    titleFont: 'Nexa',
  },
})
