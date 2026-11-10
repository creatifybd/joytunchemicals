// One banner per published care category. Select existing catalogue assets only.
// Do not generate, crop, recolour or rewrite product packaging artwork.
export function getCategoryBanners(site, products) {
  const available=products.filter(product=>product.status==='active')
  return (site.categories||[]).filter(category=>category.status==='active').map(category=>{
    const matches=available.filter(product=>product.category===category.id||product.cat===category.cat)
    const preferred=matches.find(product=>product.slug===category.image||product.id===category.image)||matches[0]
    const companion=matches.find(product=>product.id!==preferred?.id)
    return preferred ? {category,primary:preferred,secondary:companion||null} : null
  }).filter(Boolean)
}
