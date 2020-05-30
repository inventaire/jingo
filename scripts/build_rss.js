#!/usr/bin/env node
const RSS = require('rss')
const marked = require('marked')
const { readFileSync, writeFileSync } = require('fs')
const { createHash } = require('crypto')
const blogIndexPath = './data/Blog.md'
const md5Hash = input => createHash('md5').update(input).digest('hex')

let blogIndex
try {
  blogIndex = readFileSync(blogIndexPath).toString()
} catch (err) {
  if (err.code === 'ENOENT') {
    console.error('blog index not found', blogIndexPath)
    process.exit(1)
  } else {
    throw err
  }
}

const feed = new RSS({
  title: 'Inventaire Blog',
  description: 'Get occasional news around the project Inventaire',
  feed_url: 'https://wiki.inventaire.io/blog.rss',
  site_url: 'https://wiki.inventaire.io/wiki/Blog',
  image_url: 'https://wiki.inventaire.io/img/inventaire-brittanystevens-square.200x200.jpg',
  language: 'en',
  ttl: 3 * 24 * 60
})

const parseLine = line => {
  line = line.replace(/^\* /, '')

  let [ categoryPart, rest ] = line.split('**:')

  const [ category, language ] = categoryPart.match(/(\w+) \[(\w{2})\]/).slice(1)

  rest = rest.trim()

  const parts = rest.split(',')
  const timespace = parts.slice(-1)[0].trim()
  const dateMatch = timespace.match(/(\d{4}-\d{2}(-\d{2})?)$/)
  const date = dateMatch && dateMatch[1]

  const firstPart = parts[0]

  description = marked(line)

  let title, url, internalUrl
  if (rest.startsWith('[[')) {
    [ internalUrl, title ] = rest.split(']]')[0].split('|')
    internalUrl = internalUrl.replace('[[', '')
    url = `https://wiki.inventaire.io/wiki/${internalUrl}`
    description = description.replace(`[[${internalUrl}|${title}]]`, `<a href="${url}">${title}</a>`)
  } else if (rest.startsWith('[')) {
    title = rest.split(']')[0].replace(/^\[/, '')
    url = rest.split(']')[1].split(')')[0].replace(/^\(/, '')
  } else {
    title = rest.split(':')[0]
    url = rest.match(/\]\((http[^()[\]]+)\)/)[1]
  }

  title = `${category} [${language}]: ${title}`

  guid = md5Hash(line)

  return { title, description, url, guid, category, language, date }
}


blogIndex
  .split('\n')
  .filter(line => line.startsWith('* **'))
  .map(parseLine)
  .forEach(feed.item.bind(feed))

const xml = feed.xml({ indent: true })

writeFileSync('./public/blog.rss', xml)
