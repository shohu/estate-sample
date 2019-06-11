'use strict';

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');
const Fabric = use('/../app/Library/Fabric');

Route.on('/').render('welcome');

Route.get('/estates', async ({ view }) => {
  const estates = await Fabric.estates();
  return view.render('estates', { estates: estates });
});

Route.get('/estates/:category/:code', async ({ params, view }) => {
  const estate = await Fabric.find(params.category, params.code);
  return view.render('detail', { estate: estate });
});

Route.get('/estates/create', async ({ view }) => {
  return view.render('create');
});

Route.post('/estates/create', async ({ request, response }) => {
  // TODO:validation
  const data = request.only([
    'code',
    'ownercode',
    'name',
    'category',
    'price',
    'unit',
    'devideTerm',
    'establishedAt'
  ]);
  console.log('post data ====', data);
  const estate = await Fabric.create(data);
  return response.redirect('/estates/' + estate.category + '/' + estate.code);
});
