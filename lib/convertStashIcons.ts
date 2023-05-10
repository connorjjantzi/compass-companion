export default function converStashIcons(name: string) {
  //links to stash tab images
  const images: { [key: string]: string } = {
    MapStash:
      "https://web.poecdn.com/protected/image/layout/stash/currency-tab-icon.png?v=1680235310710&key=c4JmwvlEdlm1iitgRJ-LtQ",
    QuadStash:
      "https://web.poecdn.com/protected/image/layout/stash/quad-tab-icon.png?v=1680235310966&key=SO7Jf8d6g68rhHKJVt1Itw",
    PremiumStash:
      "https://web.poecdn.com/protected/image/layout/stash/premium-tab-icon.png?v=1680235310966&key=eFcoMl6FRQpBrNgSIvNgYQ",
    CurrencyStash:
      "https://web.poecdn.com/protected/image/layout/stash/currency-tab-icon.png?v=1680235310710&key=c4JmwvlEdlm1iitgRJ-LtQ",
    EssenceStash:
      "https://web.poecdn.com/protected/image/layout/stash/essence-tab-icon.png?v=1680235310746&key=3sC1L24_-V0QEze0P8r_Dg",
    DivinationCardStash:
      "https://web.poecdn.com/protected/image/layout/stash/divination-tab-icon.png?v=1680235310746&key=FaLsxYtmuqBXkJebdF62_w",
    FragmentStash:
      "https://web.poecdn.com/protected/image/layout/stash/fragment-tab-icon.png?v=1680235310830&key=NIXjytgKBeGX-0ed5uJWeA",
  };
  return images[name];
}
