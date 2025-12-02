if (!self.define) {
  let e,
    a = {};
  const s = (s, c) => (
    (s = new URL(s + ".js", c).href),
    a[s] ||
      new Promise((a) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = s), (e.onload = a), document.head.appendChild(e);
        } else (e = s), importScripts(s), a();
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, i) => {
    const t =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (a[t]) return;
    let n = {};
    const d = (e) => s(e, t),
      r = { module: { uri: t }, exports: n, require: d };
    a[t] = Promise.all(c.map((e) => r[e] || d(e))).then((e) => (i(...e), n));
  };
}
define(["./workbox-4754cb34"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "04cbd5dd2807c134219faf224724ff6e",
        },
        {
          url: "/_next/static/UzJTvf4TyVj3HmhUc8x74/_buildManifest.js",
          revision: "4f0666143150431e0325f02c8a50b059",
        },
        {
          url: "/_next/static/UzJTvf4TyVj3HmhUc8x74/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/1066.6f870d896b7e2e15.js",
          revision: "6f870d896b7e2e15",
        },
        {
          url: "/_next/static/chunks/1227.b6623fb5d6626654.js",
          revision: "b6623fb5d6626654",
        },
        {
          url: "/_next/static/chunks/1255-5e80850ee659f6b0.js",
          revision: "5e80850ee659f6b0",
        },
        {
          url: "/_next/static/chunks/1352.445b96b0ec30784e.js",
          revision: "445b96b0ec30784e",
        },
        {
          url: "/_next/static/chunks/142.6382dd52e816496a.js",
          revision: "6382dd52e816496a",
        },
        {
          url: "/_next/static/chunks/1438.a5e72241703ad1da.js",
          revision: "a5e72241703ad1da",
        },
        {
          url: "/_next/static/chunks/15.1b02d8b48b41fdfa.js",
          revision: "1b02d8b48b41fdfa",
        },
        {
          url: "/_next/static/chunks/1608.c50e3948b0bc8d4d.js",
          revision: "c50e3948b0bc8d4d",
        },
        {
          url: "/_next/static/chunks/1646.a93085a0445ba909.js",
          revision: "a93085a0445ba909",
        },
        {
          url: "/_next/static/chunks/164f4fb6.a72a6a5cb18d18f5.js",
          revision: "a72a6a5cb18d18f5",
        },
        {
          url: "/_next/static/chunks/1778.7ef3139c2a58e771.js",
          revision: "7ef3139c2a58e771",
        },
        {
          url: "/_next/static/chunks/1819.1c408df52d7fb0ee.js",
          revision: "1c408df52d7fb0ee",
        },
        {
          url: "/_next/static/chunks/199.9b1d042aaa3ccbad.js",
          revision: "9b1d042aaa3ccbad",
        },
        {
          url: "/_next/static/chunks/1995.d1c629f8f9c30fe5.js",
          revision: "d1c629f8f9c30fe5",
        },
        {
          url: "/_next/static/chunks/2008-d9ffd8d7407de74c.js",
          revision: "d9ffd8d7407de74c",
        },
        {
          url: "/_next/static/chunks/2267.915aab57bf5599e6.js",
          revision: "915aab57bf5599e6",
        },
        {
          url: "/_next/static/chunks/2287.03bb999bee1e4b03.js",
          revision: "03bb999bee1e4b03",
        },
        {
          url: "/_next/static/chunks/2289-8f96839de22fa29f.js",
          revision: "8f96839de22fa29f",
        },
        {
          url: "/_next/static/chunks/2499.71e429bfc092466d.js",
          revision: "71e429bfc092466d",
        },
        {
          url: "/_next/static/chunks/2619-b8db57ac19da49ac.js",
          revision: "b8db57ac19da49ac",
        },
        {
          url: "/_next/static/chunks/2646.5e778d8fd7c8a089.js",
          revision: "5e778d8fd7c8a089",
        },
        {
          url: "/_next/static/chunks/2700.db8139ba8fbe50d1.js",
          revision: "db8139ba8fbe50d1",
        },
        {
          url: "/_next/static/chunks/280273a7.6b496659f89996dc.js",
          revision: "6b496659f89996dc",
        },
        {
          url: "/_next/static/chunks/2931.1f75acecf5145b86.js",
          revision: "1f75acecf5145b86",
        },
        {
          url: "/_next/static/chunks/2970.c9dd3ba9299d907d.js",
          revision: "c9dd3ba9299d907d",
        },
        {
          url: "/_next/static/chunks/3032.e60c35bc97ad678f.js",
          revision: "e60c35bc97ad678f",
        },
        {
          url: "/_next/static/chunks/3214.01c601c9e2a6f000.js",
          revision: "01c601c9e2a6f000",
        },
        {
          url: "/_next/static/chunks/3272.fa4b6d8e338f6737.js",
          revision: "fa4b6d8e338f6737",
        },
        {
          url: "/_next/static/chunks/34.c61f8ade45bb0ab1.js",
          revision: "c61f8ade45bb0ab1",
        },
        {
          url: "/_next/static/chunks/3409.4370a335c6ed1153.js",
          revision: "4370a335c6ed1153",
        },
        {
          url: "/_next/static/chunks/363.5888f3b5f76f9616.js",
          revision: "5888f3b5f76f9616",
        },
        {
          url: "/_next/static/chunks/3697.98e74f13c63cd6d0.js",
          revision: "98e74f13c63cd6d0",
        },
        {
          url: "/_next/static/chunks/3909.e32423f2eba7ec42.js",
          revision: "e32423f2eba7ec42",
        },
        {
          url: "/_next/static/chunks/3925.dfa89a5c6f5a728e.js",
          revision: "dfa89a5c6f5a728e",
        },
        {
          url: "/_next/static/chunks/3955.12f8d1913f8bf501.js",
          revision: "12f8d1913f8bf501",
        },
        {
          url: "/_next/static/chunks/4034.dc23d8975dc29e66.js",
          revision: "dc23d8975dc29e66",
        },
        {
          url: "/_next/static/chunks/4060.8ece674531ef2d4e.js",
          revision: "8ece674531ef2d4e",
        },
        {
          url: "/_next/static/chunks/4199.ec6d7667517cef42.js",
          revision: "ec6d7667517cef42",
        },
        {
          url: "/_next/static/chunks/4200.e4d865692dc7f025.js",
          revision: "e4d865692dc7f025",
        },
        {
          url: "/_next/static/chunks/4448.e73e747be1354ac8.js",
          revision: "e73e747be1354ac8",
        },
        {
          url: "/_next/static/chunks/4505.0ee4848e74f72470.js",
          revision: "0ee4848e74f72470",
        },
        {
          url: "/_next/static/chunks/4550.6a644e73d2f62ec2.js",
          revision: "6a644e73d2f62ec2",
        },
        {
          url: "/_next/static/chunks/4551.1be1ed5592b7d852.js",
          revision: "1be1ed5592b7d852",
        },
        {
          url: "/_next/static/chunks/4580.1c7fd849cd068aed.js",
          revision: "1c7fd849cd068aed",
        },
        {
          url: "/_next/static/chunks/4914.b0db9976e8625e20.js",
          revision: "b0db9976e8625e20",
        },
        {
          url: "/_next/static/chunks/4935.5b952546c0074e80.js",
          revision: "5b952546c0074e80",
        },
        {
          url: "/_next/static/chunks/4bd1b696-100b9d70ed4e49c1.js",
          revision: "100b9d70ed4e49c1",
        },
        {
          url: "/_next/static/chunks/5057.b98a8a6d32a5deb7.js",
          revision: "b98a8a6d32a5deb7",
        },
        {
          url: "/_next/static/chunks/5125-f64922302e738a1a.js",
          revision: "f64922302e738a1a",
        },
        {
          url: "/_next/static/chunks/5139.e4ff9cc3669129ed.js",
          revision: "e4ff9cc3669129ed",
        },
        {
          url: "/_next/static/chunks/5168.f6a7e11f1d9ba83a.js",
          revision: "f6a7e11f1d9ba83a",
        },
        {
          url: "/_next/static/chunks/5200.446cca9fd15d37b9.js",
          revision: "446cca9fd15d37b9",
        },
        {
          url: "/_next/static/chunks/5226.8b9dbfdecb194648.js",
          revision: "8b9dbfdecb194648",
        },
        {
          url: "/_next/static/chunks/5453.a63a3d02e9b2392b.js",
          revision: "a63a3d02e9b2392b",
        },
        {
          url: "/_next/static/chunks/560.6cce2e95cf493062.js",
          revision: "6cce2e95cf493062",
        },
        {
          url: "/_next/static/chunks/5622.93499a8695785308.js",
          revision: "93499a8695785308",
        },
        {
          url: "/_next/static/chunks/5624.5286c1080b8a817c.js",
          revision: "5286c1080b8a817c",
        },
        {
          url: "/_next/static/chunks/570.974d63699312875a.js",
          revision: "974d63699312875a",
        },
        {
          url: "/_next/static/chunks/5843.d3b7a4f29e6dd2d1.js",
          revision: "d3b7a4f29e6dd2d1",
        },
        {
          url: "/_next/static/chunks/5876.f044b705886b20d3.js",
          revision: "f044b705886b20d3",
        },
        {
          url: "/_next/static/chunks/5985.1b1059622ae01de9.js",
          revision: "1b1059622ae01de9",
        },
        {
          url: "/_next/static/chunks/603.b6c630ab79feb564.js",
          revision: "b6c630ab79feb564",
        },
        {
          url: "/_next/static/chunks/6226.90378bbe16dd0712.js",
          revision: "90378bbe16dd0712",
        },
        {
          url: "/_next/static/chunks/6241.a2ddeebf95ce2e26.js",
          revision: "a2ddeebf95ce2e26",
        },
        {
          url: "/_next/static/chunks/6251.96436b32890601d3.js",
          revision: "96436b32890601d3",
        },
        {
          url: "/_next/static/chunks/6265.e99f069f6dc0c933.js",
          revision: "e99f069f6dc0c933",
        },
        {
          url: "/_next/static/chunks/6290.62157644980122f9.js",
          revision: "62157644980122f9",
        },
        {
          url: "/_next/static/chunks/6386.c6975495cfd82335.js",
          revision: "c6975495cfd82335",
        },
        {
          url: "/_next/static/chunks/6489-661048fafa195d42.js",
          revision: "661048fafa195d42",
        },
        {
          url: "/_next/static/chunks/6506.c0c47e24f4ba041f.js",
          revision: "c0c47e24f4ba041f",
        },
        {
          url: "/_next/static/chunks/657.88212239252ca25f.js",
          revision: "88212239252ca25f",
        },
        {
          url: "/_next/static/chunks/6672.6c07d962fef54dab.js",
          revision: "6c07d962fef54dab",
        },
        {
          url: "/_next/static/chunks/6721.8bee67892d550ba1.js",
          revision: "8bee67892d550ba1",
        },
        {
          url: "/_next/static/chunks/6792.f24095d6e08f59d2.js",
          revision: "f24095d6e08f59d2",
        },
        {
          url: "/_next/static/chunks/680.029a373b0013e5f9.js",
          revision: "029a373b0013e5f9",
        },
        {
          url: "/_next/static/chunks/6806.69ea24234f29826d.js",
          revision: "69ea24234f29826d",
        },
        {
          url: "/_next/static/chunks/6896.2ab380fb03ae7ffc.js",
          revision: "2ab380fb03ae7ffc",
        },
        {
          url: "/_next/static/chunks/6958.4ed093845f98627d.js",
          revision: "4ed093845f98627d",
        },
        {
          url: "/_next/static/chunks/6edf0643.29e4045402af1667.js",
          revision: "29e4045402af1667",
        },
        {
          url: "/_next/static/chunks/7083.ce98679e51b336cf.js",
          revision: "ce98679e51b336cf",
        },
        {
          url: "/_next/static/chunks/7094.28f38789609da81c.js",
          revision: "28f38789609da81c",
        },
        {
          url: "/_next/static/chunks/7135.28ff0a4d75728326.js",
          revision: "28ff0a4d75728326",
        },
        {
          url: "/_next/static/chunks/7307.ba96c812e4919b2a.js",
          revision: "ba96c812e4919b2a",
        },
        {
          url: "/_next/static/chunks/7330.3349a6d778b950ea.js",
          revision: "3349a6d778b950ea",
        },
        {
          url: "/_next/static/chunks/7332.48fa170c66c3d687.js",
          revision: "48fa170c66c3d687",
        },
        {
          url: "/_next/static/chunks/7458.91be155c42c5dc43.js",
          revision: "91be155c42c5dc43",
        },
        {
          url: "/_next/static/chunks/7724.60e711baa156c3ef.js",
          revision: "60e711baa156c3ef",
        },
        {
          url: "/_next/static/chunks/7788.a95943efe93edf5c.js",
          revision: "a95943efe93edf5c",
        },
        {
          url: "/_next/static/chunks/7857.2c86754f91871caf.js",
          revision: "2c86754f91871caf",
        },
        {
          url: "/_next/static/chunks/7988.4ddc0ca3d2c0d0b0.js",
          revision: "4ddc0ca3d2c0d0b0",
        },
        {
          url: "/_next/static/chunks/8043-506b88a5f8e2fe9c.js",
          revision: "506b88a5f8e2fe9c",
        },
        {
          url: "/_next/static/chunks/8160.1d74ed5e90989d27.js",
          revision: "1d74ed5e90989d27",
        },
        {
          url: "/_next/static/chunks/8164.a8ee147631cb3b1c.js",
          revision: "a8ee147631cb3b1c",
        },
        {
          url: "/_next/static/chunks/819.7971a88ea66b6c08.js",
          revision: "7971a88ea66b6c08",
        },
        {
          url: "/_next/static/chunks/8517.7ba91567a8150045.js",
          revision: "7ba91567a8150045",
        },
        {
          url: "/_next/static/chunks/8772.333c02b18b8b9235.js",
          revision: "333c02b18b8b9235",
        },
        {
          url: "/_next/static/chunks/8808.7cc1091e23113d95.js",
          revision: "7cc1091e23113d95",
        },
        {
          url: "/_next/static/chunks/8867.392b1bd6c447c923.js",
          revision: "392b1bd6c447c923",
        },
        {
          url: "/_next/static/chunks/9001.b4f973a7540ff34c.js",
          revision: "b4f973a7540ff34c",
        },
        {
          url: "/_next/static/chunks/9018.675bc8ed3a61f1ab.js",
          revision: "675bc8ed3a61f1ab",
        },
        {
          url: "/_next/static/chunks/9129.f1b4765688ff6b87.js",
          revision: "f1b4765688ff6b87",
        },
        {
          url: "/_next/static/chunks/9240.409d93d90379841c.js",
          revision: "409d93d90379841c",
        },
        {
          url: "/_next/static/chunks/9307.30220e4a9e5e25ef.js",
          revision: "30220e4a9e5e25ef",
        },
        {
          url: "/_next/static/chunks/9364.5fe5b9ab4f6688b7.js",
          revision: "5fe5b9ab4f6688b7",
        },
        {
          url: "/_next/static/chunks/96.e6851200e39bd4e7.js",
          revision: "e6851200e39bd4e7",
        },
        {
          url: "/_next/static/chunks/9648.3a529d16abd9dbcc.js",
          revision: "3a529d16abd9dbcc",
        },
        {
          url: "/_next/static/chunks/9838.73037f0be945d4ab.js",
          revision: "73037f0be945d4ab",
        },
        {
          url: "/_next/static/chunks/9885.2023843c770a345d.js",
          revision: "2023843c770a345d",
        },
        {
          url: "/_next/static/chunks/ad2866b8.e13a3cf75ccf0eb8.js",
          revision: "e13a3cf75ccf0eb8",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-98d5c0edec78a3d2.js",
          revision: "98d5c0edec78a3d2",
        },
        {
          url: "/_next/static/chunks/app/api/auth/%5B...nextauth%5D/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/auth/register/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/categories/%5Bid%5D/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/categories/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/commodity/%5Bid%5D/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/commodity/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/companies/%5Bid%5D/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/companies/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/location/%5Bid%5D/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/location/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/managecompany/%5Bid%5D/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/managecompany/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/purchases/%5Bid%5D/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/purchases/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/rate/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/rate/send-monthly-report/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/rateupdate/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/sauda-status/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/sauda/getSaudaByNumber/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/save-sauda/description-stats/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/save-sauda/description-top/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/save-sauda/export-sauda/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/save-sauda/get-by-date/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/save-sauda/notifications/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/save-sauda/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/save-sauda/sauda-descriptions/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/save-sauda/sauda-total-by-date/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/save-sauda/self-sauda/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/save-sauda/sell-agarwal/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/save-sauda/tag-sauda/%5Bid%5D/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/save-sauda/tag-sauda/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/seller/%5Bid%5D/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/seller/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/send-sauda-email/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/api/user-companies/route-d55486b7d18caa6b.js",
          revision: "d55486b7d18caa6b",
        },
        {
          url: "/_next/static/chunks/app/buyercompany/page-ea945796e2b039b7.js",
          revision: "ea945796e2b039b7",
        },
        {
          url: "/_next/static/chunks/app/category/page-3458ebc07cfd750b.js",
          revision: "3458ebc07cfd750b",
        },
        {
          url: "/_next/static/chunks/app/commodity/page-2f02044c70d6209b.js",
          revision: "2f02044c70d6209b",
        },
        {
          url: "/_next/static/chunks/app/company/page-6c137fc1fa2b286a.js",
          revision: "6c137fc1fa2b286a",
        },
        {
          url: "/_next/static/chunks/app/dashboard/page-59ef828d98dad985.js",
          revision: "59ef828d98dad985",
        },
        {
          url: "/_next/static/chunks/app/forgot-password/page-e965999b7a2f331a.js",
          revision: "e965999b7a2f331a",
        },
        {
          url: "/_next/static/chunks/app/layout-4a67a7a8227dc1e6.js",
          revision: "4a67a7a8227dc1e6",
        },
        {
          url: "/_next/static/chunks/app/location/page-63bce53264d431e0.js",
          revision: "63bce53264d431e0",
        },
        {
          url: "/_next/static/chunks/app/managecompany/page-c1d641f8b1dbc0e9.js",
          revision: "c1d641f8b1dbc0e9",
        },
        {
          url: "/_next/static/chunks/app/page-a79f585341853702.js",
          revision: "a79f585341853702",
        },
        {
          url: "/_next/static/chunks/app/previoussauda/page-304e65868a485b77.js",
          revision: "304e65868a485b77",
        },
        {
          url: "/_next/static/chunks/app/rate/%5Bid%5D/page-fa93163a660f0efa.js",
          revision: "fa93163a660f0efa",
        },
        {
          url: "/_next/static/chunks/app/rate/page-8bcb833d3ecef3f4.js",
          revision: "8bcb833d3ecef3f4",
        },
        {
          url: "/_next/static/chunks/app/register/page-6c550ae8951ada33.js",
          revision: "6c550ae8951ada33",
        },
        {
          url: "/_next/static/chunks/app/resetpassword/page-f1bc20faf54a341b.js",
          revision: "f1bc20faf54a341b",
        },
        {
          url: "/_next/static/chunks/app/sauda/page-7d124cea53c92719.js",
          revision: "7d124cea53c92719",
        },
        {
          url: "/_next/static/chunks/app/selfcompany/page-5fdfdead63d76ec5.js",
          revision: "5fdfdead63d76ec5",
        },
        {
          url: "/_next/static/chunks/app/seller/page-624f1d6c8c9afdba.js",
          revision: "624f1d6c8c9afdba",
        },
        {
          url: "/_next/static/chunks/app/sellercompany/page-60adbb69ad5b0c89.js",
          revision: "60adbb69ad5b0c89",
        },
        {
          url: "/_next/static/chunks/bc98253f.d6fc8a0138855acd.js",
          revision: "d6fc8a0138855acd",
        },
        {
          url: "/_next/static/chunks/ca377847.e1e3fe32030eee4f.js",
          revision: "e1e3fe32030eee4f",
        },
        {
          url: "/_next/static/chunks/framework-acb38774a4ee775d.js",
          revision: "acb38774a4ee775d",
        },
        {
          url: "/_next/static/chunks/main-4ee67ce643062268.js",
          revision: "4ee67ce643062268",
        },
        {
          url: "/_next/static/chunks/main-app-bef562bb439d4bee.js",
          revision: "bef562bb439d4bee",
        },
        {
          url: "/_next/static/chunks/pages/_app-e8b861c87f6f033c.js",
          revision: "e8b861c87f6f033c",
        },
        {
          url: "/_next/static/chunks/pages/_error-c8f84f7bd11d43d4.js",
          revision: "c8f84f7bd11d43d4",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-fcc76faffa986082.js",
          revision: "fcc76faffa986082",
        },
        {
          url: "/_next/static/css/715be398208dca58.css",
          revision: "715be398208dca58",
        },
        {
          url: "/_next/static/css/dd42ef82cf3e0af4.css",
          revision: "dd42ef82cf3e0af4",
        },
        {
          url: "/_next/static/css/de70bee13400563f.css",
          revision: "de70bee13400563f",
        },
        {
          url: "/_next/static/media/4cf2300e9c8272f7-s.p.woff2",
          revision: "18bae71b1e1b2bb25321090a3b563103",
        },
        {
          url: "/_next/static/media/747892c23ea88013-s.woff2",
          revision: "a0761690ccf4441ace5cec893b82d4ab",
        },
        {
          url: "/_next/static/media/8d697b304b401681-s.woff2",
          revision: "cc728f6c0adb04da0dfcb0fc436a8ae5",
        },
        {
          url: "/_next/static/media/93f479601ee12b01-s.p.woff2",
          revision: "da83d5f06d825c5ae65b7cca706cb312",
        },
        {
          url: "/_next/static/media/9610d9e46709d722-s.woff2",
          revision: "7b7c0ef93df188a852344fc272fc096b",
        },
        {
          url: "/_next/static/media/ba015fad6dcf6784-s.woff2",
          revision: "8ea4f719af3312a055caf09f34c89a77",
        },
        { url: "/file.svg", revision: "d09f95206c3fa0bb9bd9fefabfd0ea71" },
        { url: "/globe.svg", revision: "2aaafa6a49b6563925fe440891e32717" },
        {
          url: "/icons/android-chrome-192x192.png",
          revision: "8f52716072c95f8a9f4f1aef94fbee8c",
        },
        {
          url: "/icons/android-chrome-512x512.png",
          revision: "c3cf19ad1bb633655d8fa7a2c782c025",
        },
        {
          url: "/icons/apple-touch-icon.png",
          revision: "8fcb074b408ff31b5dde43c2422652eb",
        },
        {
          url: "/icons/favicon-16x16.png",
          revision: "639066c80a98dc3d35dfbff12871ae4b",
        },
        {
          url: "/icons/favicon-32x32.png",
          revision: "9f219d3ac2adcfdea5807668b3bee631",
        },
        {
          url: "/images/og-image1.png",
          revision: "f09bb54c26c3aed710f787f66f520b4d",
        },
        {
          url: "/logo/logo1.png",
          revision: "f09bb54c26c3aed710f787f66f520b4d",
        },
        {
          url: "/logo/watermark1.png",
          revision: "4c46a1f13975b5d59bc28622cc671949",
        },
        { url: "/manifest.json", revision: "06cebd8d47f7242de430a35c04452bc9" },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        {
          url: "/notification/notification.wav",
          revision: "8646c43bb795c88a170eed5d7893fcc3",
        },
        { url: "/vercel.svg", revision: "9cc57fdebfd38224bfdc455be1c3d799" },
        { url: "/vercel6.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
        { url: "/window.svg", revision: "a2760511c65806022ad20adf74370ff3" },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: a,
              event: s,
              state: c,
            }) =>
              a && "opaqueredirect" === a.type
                ? new Response(a.body, {
                    status: 200,
                    statusText: "OK",
                    headers: a.headers,
                  })
                : a,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const a = e.pathname;
        return !a.startsWith("/api/auth/") && !!a.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET"
    );
});
