<template>
    <header class="main_header" id="header">
        <a href="#header" class="logo">logo</a>
        <div class="toggle"></div>
        <ul>
            <li><a href="#">Produit</a></li>
            <li><a href="#">Galerie</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">À propos</a></li>
            <li><a href="#">Support</a></li>
        </ul>
    </header>
</template>

<script>
    window.addEventListener('scroll',function(){
    var header = document.querySelector('header');
    header.classList.toggle('sticky',window.scrollY > 0);
    });
</script>

<style scoped>
    header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 40px 100px;
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: 0.5s;
    }
    header .logo {
    color: #fff;
    font-size: 24px;
    text-transform: uppercase; /* MAJUSCULE */
    text-decoration: none;
    font-weight: 600;
    letter-spacing: 2px;
    }
    header .logo img {
    width: 25px;
    display: none;
    }
    @media screen and (max-width: 570px) {
    header .logo {
        display: none;
    }
    header ul {
        width: auto;
        margin: 0 auto;
    }
    }
    header ul {
    position: relative;
    display: flex;
    }
    header ul li {
    position: relative;
    list-style: none;
    margin-right: 50px;
    }
    header ul li a {
    font-weight: 200;
    position: relative;
    display: inline-block;
    margin: 0 15px;
    color: #fff;
    text-decoration: none;
    }
    header ul li a:hover {
    color: darkorange;
    }

    header.sticky {
    background-color: #fff;
    padding: 20px 100px;
    }
    header.sticky .logo {
    color: #000;
    }
    header.sticky ul li a {
    color: #000;
    }

    @media screen and (max-width: 570px) {
    header {
        margin: 30px auto;
        padding: 0;
    }
    header ul li {
        margin-right: 15px;
    }
    header ul li a {
        font-size: 1.2rem;
        font-weight: 400;
    }
    }
    @media screen and (max-width: 770px) {
    .logo {
        margin-right: 40px;
    }
    }
</style>